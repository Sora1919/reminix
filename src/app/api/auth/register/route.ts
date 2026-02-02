import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
    isStrongPassword,
    isValidEmail,
    normalizeEmail,
    normalizeName,
    PASSWORD_MIN_LENGTH,
} from "@/lib/auth/validation";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing fields" },
                { status: 400 }
            );
        }

        const normalizedEmail = normalizeEmail(email);
        const normalizedName = normalizeName(name);

        if (!isValidEmail(normalizedEmail)) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        if (normalizedName.length < 2 || normalizedName.length > 50) {
            return NextResponse.json(
                { error: "Name must be between 2 and 50 characters" },
                { status: 400 }
            );
        }

        if (!isStrongPassword(password)) {
            return NextResponse.json(
                {
                    error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters and include uppercase, lowercase, and a number`,
                },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.create({
            data: {
                name: normalizedName,
                email: normalizedEmail,
                password: hashedPassword,
            },
        });

        return NextResponse.json(
            { message: "User created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
