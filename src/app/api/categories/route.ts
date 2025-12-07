import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories);
}

export async function POST(req: Request) {
    try {
        const { name } = await req.json();

        const category = await prisma.category.create({
            data: { name }
        });

        return NextResponse.json(category);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}
