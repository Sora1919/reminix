import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
    const session = await getServerSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notes = await prisma.notification.findMany({
        where: { userId: Number(session.user.id) },
        orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(notes);
}
