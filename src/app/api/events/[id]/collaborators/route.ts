// app/api/events/[id]/collaborators/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const parsedEventId = parseInt(eventId);

        const collaborators = await prisma.collaborator.findMany({
            where: { eventId: parsedEventId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            },
            orderBy: { id: 'asc' }
        });

        return NextResponse.json(collaborators);
    } catch (error) {
        console.error("Get collaborators error:", error);
        return NextResponse.json(
            { error: "Failed to fetch collaborators" },
            { status: 500 }
        );
    }
}