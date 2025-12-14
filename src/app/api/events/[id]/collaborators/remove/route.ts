// app/api/events/[id]/collaborators/remove/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId } = await req.json();

        // Parse IDs
        const currentUserId = parseInt(session.user.id);
        const parsedEventId = parseInt(eventId);
        const parsedUserId = parseInt(userId);

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: parsedEventId }
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Check if current user is the event creator
        if (event.creatorId !== currentUserId) {
            return NextResponse.json(
                { error: "Only event creator can remove collaborators" },
                { status: 403 }
            );
        }

        // Remove collaborator
        await prisma.collaborator.delete({
            where: {
                eventId_userId: {
                    eventId: parsedEventId,
                    userId: parsedUserId
                }
            }
        });

        await prisma.notification.create({
            data: {
                userId: parsedUserId, // The user who was removed
                eventId: parsedEventId,
                message: `You've been removed as a collaborator from event "${event.title}"`,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Remove collaborator error:", error);

        // Handle specific errors
        if (error.code === "P2025") { // Record not found
            return NextResponse.json(
                { error: "Collaborator not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to remove collaborator" },
            { status: 500 }
        );
    }


}