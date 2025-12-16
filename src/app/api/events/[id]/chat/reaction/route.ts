// app/api/events/[id]/chat/reactions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentUserId = parseInt(session.user.id);
        const eventId = parseInt(id);
        const { messageId, emoji } = await req.json();

        if (!messageId || !emoji) {
            return NextResponse.json(
                { error: "Message ID and emoji are required" },
                { status: 400 }
            );
        }

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

        // Check if message exists
        const message = await prisma.chatMessage.findUnique({
            where: { id: messageId },
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

        if (message.chatRoom.eventId !== eventId) {
            return NextResponse.json(
                { error: "Message doesn't belong to this event" },
                { status: 400 }
            );
        }

        // Add or toggle reaction
        const existingReaction = await prisma.messageReaction.findUnique({
            where: {
                messageId_userId_emoji: {
                    messageId,
                    userId: currentUserId,
                    emoji,
                },
            },
        });

        let reaction;

        if (existingReaction) {
            // Remove reaction
            await prisma.messageReaction.delete({
                where: { id: existingReaction.id },
            });
            reaction = null;
        } else {
            // Add reaction
            reaction = await prisma.messageReaction.create({
                data: {
                    messageId,
                    userId: currentUserId,
                    emoji,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            });
        }

        // Get updated reactions for the message
        const updatedReactions = await prisma.messageReaction.findMany({
            where: { messageId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                reaction,
                reactions: updatedReactions,
            },
        });
    } catch (error) {
        console.error("Reaction error:", error);
        return NextResponse.json(
            { error: "Failed to update reaction" },
            { status: 500 }
        );
    }
}