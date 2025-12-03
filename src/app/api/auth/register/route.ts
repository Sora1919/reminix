import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password)
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser)
            return NextResponse.json(
                { message: "Email already exists" },
                { status: 400 }
            );

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json(
            { message: "User registered successfully" },
            { status: 201 }
        );
    } catch (err) {
        return NextResponse.json(
            { message: "Server error", error: err },
            { status: 500 }
        );
    }
}
