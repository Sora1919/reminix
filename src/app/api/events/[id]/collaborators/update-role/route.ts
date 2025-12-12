// app/api/events/[id]/collaborators/update-role/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId, role } = await req.json();

        // Parse IDs
        const currentUserId = parseInt(session.user.id);
        const parsedEventId = parseInt(eventId);
        const parsedUserId = parseInt(userId);

        // Check event
        const event = await prisma.event.findUnique({
            where: { id: parsedEventId }
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Only creator can update
        if (event.creatorId !== currentUserId) {
            return NextResponse.json(
                { error: "Only event creator can update roles" },
                { status: 403 }
            );
        }

        // Update role
        const updated = await prisma.collaborator.update({
            where: {
                eventId_userId: {
                    eventId: parsedEventId,
                    userId: parsedUserId
                }
            },
            data: { role },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update role error:", error);
        return NextResponse.json(
            { error: "Failed to update role" },
            { status: 500 }
        );
    }
}