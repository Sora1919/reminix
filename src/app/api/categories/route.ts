import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.category.findMany();
        return NextResponse.json(categories);
    } catch (e) {
        console.error("GET /categories error", e);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, color } = await req.json();
        if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

        const category = await prisma.category.create({
            data: { name, color: color ?? "#4CAF50" }
        });

        return NextResponse.json(category, { status: 201 });
    } catch (e) {
        console.error("POST /categories error", e);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}
