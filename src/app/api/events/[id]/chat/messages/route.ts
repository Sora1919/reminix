// app/api/events/[id]/chat/messages/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
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
        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get("cursor");
        const limit = parseInt(searchParams.get("limit") || "50");
        const beforeId = searchParams.get("beforeId");

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

        // Get chat room
        const chatRoom = await prisma.chatRoom.findUnique({
            where: { eventId },
        });

        if (!chatRoom) {
            return NextResponse.json(
                { error: "Chat room not found" },
                { status: 404 }
            );
        }

        // Build query for pagination
        const where: any = {
            chatRoomId: chatRoom.id,
            isDeleted: false,
        };

        if (cursor) {
            where.id = { lt: parseInt(cursor) };
        } else if (beforeId) {
            where.id = { gt: parseInt(beforeId) };
        }

        // Get messages
        const messages = await prisma.chatMessage.findMany({
            where,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                reactions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        const nextCursor = messages.length > 0 ? messages[messages.length - 1].id : null;
        const hasMore = messages.length === limit;

        return NextResponse.json({
            success: true,
            data: messages,
            pagination: {
                nextCursor,
                hasMore,
                total: messages.length,
            },
        });
    } catch (error) {
        console.error("Get messages error:", error);
        return NextResponse.json(
            { error: "Failed to get messages" },
            { status: 500 }
        );
    }
}

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
        const { content, messageType = "text", fileUrl, fileName, fileSize, replyToId } = await req.json();

        if (!content && !fileUrl) {
            return NextResponse.json(
                { error: "Message content or file is required" },
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

        // Get chat room
        let chatRoom = await prisma.chatRoom.findUnique({
            where: { eventId },
            include: {
                participants: true,
            },
        });

        // Create chat room if it doesn't exist
        if (!chatRoom) {
            if (event.creatorId !== currentUserId) {
                return NextResponse.json(
                    { error: "Chat room not found" },
                    { status: 404 }
                );
            }

            chatRoom = await prisma.chatRoom.create({
                data: {
                    eventId,
                    name: `Chat: ${event.title}`,
                    description: `Chat room for event: ${event.title}`,
                    participants: {
                        create: [
                            { userId: event.creatorId, role: "admin" },
                            ...event.collaborators.map(c => ({ userId: c.userId, role: "member" })),
                        ],
                    },
                },
                include: {
                    participants: true,
                },
            });
        }

        // Check if user is participant
        const isParticipant = chatRoom.participants.some(p => p.userId === currentUserId);
        if (!isParticipant) {
            await prisma.chatRoomParticipant.create({
                data: {
                    chatRoomId: chatRoom.id,
                    userId: currentUserId,
                    role: "member",
                },
            });
        }

        // Create message
        const message = await prisma.chatMessage.create({
            data: {
                chatRoomId: chatRoom.id,
                userId: currentUserId,
                content: content?.trim() || "",
                messageType,
                fileUrl,
                fileName,
                fileSize,
                replyToId,
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
                reactions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        // Create notifications for other participants
        const otherParticipants = chatRoom.participants.filter(p => p.userId !== currentUserId);

        const notificationPromises = otherParticipants.map(participant =>
            prisma.notification.create({
                data: {
                    userId: participant.userId,
                    eventId: eventId,
                    type: "CHAT_MESSAGE",
                    message: `New message in ${event.title}: ${content?.substring(0, 50)}...`,
                },
            })
        );

        await Promise.all(notificationPromises);

        return NextResponse.json({
            success: true,
            data: message,
        }, { status: 201 });
    } catch (error) {
        console.error("Send message error:", error);
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}