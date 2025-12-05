import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        console.log("Register Api is called");

        const body = await req.json();
        console.log("Received body:", body);

        const { name, email, password } = body;

        if (!name || !email || !password) {
            console.log("❌ Some field is missing.");
            return NextResponse.json(
                {message: "All fields are required"},
                {status: 400}
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log("❌ Email already exists");
            return NextResponse.json(
                {message: "Email already exists"},
                {status: 400}
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        console.log("✅ User created:", newUser);

        return NextResponse.json(
            { message: "User registered successfully" },
            { status: 201 }
        );
    } catch (err) {
        console.error("❌ Register Error:", err);
        return NextResponse.json(
            { message: "Server error", error: err },
            { status: 500 }
        );
    }
}
