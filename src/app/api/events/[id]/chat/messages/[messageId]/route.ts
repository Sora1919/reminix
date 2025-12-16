// app/api/events/[id]/chat/messages/[messageId]/route.ts (PATCH method)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; messageId: string }> }
) {
    try {
        const { id, messageId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = parseInt(session.user.id);
        const eventId = parseInt(id);
        const msgId = parseInt(messageId);
        const { content } = await req.json();

        if (!content?.trim()) {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            );
        }

        // Check access to event
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { collaborators: true },
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const hasAccess =
            event.creatorId === userId ||
            event.collaborators.some(c => c.userId === userId);

        if (!hasAccess) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Get the message
        const message = await prisma.chatMessage.findUnique({
            where: { id: msgId },
            include: { chatRoom: true },
        });

        if (!message) {
            return NextResponse.json(
                { error: "Message not found" },
                { status: 404 }
            );
        }

        // Check permission (only message owner can edit)
        if (message.userId !== userId) {
            return NextResponse.json(
                { error: "You can only edit your own messages" },
                { status: 403 }
            );
        }

        // Update message
        const updatedMessage = await prisma.chatMessage.update({
            where: { id: msgId },
            data: {
                content: content.trim(),
                isEdited: true,
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

        return NextResponse.json({
            success: true,
            data: updatedMessage,
        });
    } catch (error) {
        console.error("Edit message error:", error);
        return NextResponse.json(
            { error: "Failed to edit message" },
            { status: 500 }
        );
    }
}

// app/api/events/[id]/chat/messages/[messageId]/route.ts (DELETE method)
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

        const userId = parseInt(session.user.id);
        const eventId = parseInt(id);
        const msgId = parseInt(messageId);

        // Check access to event
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { collaborators: true },
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const hasAccess =
            event.creatorId === userId ||
            event.collaborators.some(c => c.userId === userId);

        if (!hasAccess) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Get the message
        const message = await prisma.chatMessage.findUnique({
            where: { id: msgId },
            include: { chatRoom: true },
        });

        if (!message) {
            return NextResponse.json(
                { error: "Message not found" },
                { status: 404 }
            );
        }

        // Check permission (only message owner or event creator can delete)
        const isMessageOwner = message.userId === userId;
        const isEventCreator = event.creatorId === userId;

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
                content: "This message was deleted",
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