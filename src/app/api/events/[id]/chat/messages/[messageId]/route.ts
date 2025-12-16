// app/api/events/[id]/chat/messages/[messageId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { broadcastToEvent } from "../../stream/route";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; messageId: string }> }
) {
    try {
        const { id, messageId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentUserId = parseInt(session.user.id);
        const eventId = parseInt(id);
        const msgId = parseInt(messageId);

        // Check access
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                collaborators: true,
            },
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const hasAccess =
            event.creatorId === currentUserId ||
            event.collaborators.some(c => c.userId === currentUserId);

        if (!hasAccess) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        // Get the message
        const message = await prisma.chatMessage.findUnique({
            where: { id: msgId },
            include: {
                chatRoom: true,
            },
        });

        if (!message) {
            return NextResponse.json(
                { error: "Message not found" },
                { status: 404 }
            );
        }

        // Check permission (only message owner or admin can delete)
        const isMessageOwner = message.userId === currentUserId;
        const isEventCreator = event.creatorId === currentUserId;

        if (!isMessageOwner && !isEventCreator) {
            return NextResponse.json(
                { error: "You can only delete your own messages" },
                { status: 403 }
            );
        }

        // Soft delete
        const updatedMessage = await prisma.chatMessage.update({
            where: { id: msgId },
            data: {
                isDeleted: true,
                content: "[This message was deleted]",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        });

        // Broadcast deletion
        broadcastToEvent(eventId, {
            type: "message_deleted",
            data: updatedMessage,
        });

        return NextResponse.json({
            success: true,
            data: updatedMessage,
        });
    } catch (error) {
        console.error("Delete message error:", error);
        return NextResponse.json(
            { error: "Failed to delete message" },
            { status: 500 }
        );
    }
}