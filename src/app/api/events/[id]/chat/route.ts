// app/api/events/[id]/chat/route.ts
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

        // Check if user has access to the event
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                collaborators: true,
                creator: true,
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
                { error: "You don't have access to this event's chat" },
                { status: 403 }
            );
        }

        // Get or create chat room
        let chatRoom = await prisma.chatRoom.findUnique({
            where: { eventId },
            include: {
                participants: {
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
                },
                _count: {
                    select: {
                        messages: true,
                    },
                },
            },
        });

        // Create chat room if it doesn't exist (only creator can create)
        if (!chatRoom) {
            if (event.creatorId !== currentUserId) {
                return NextResponse.json(
                    { error: "Chat room not created yet. Only event creator can create it." },
                    { status: 404 }
                );
            }

            // Create chat room with all collaborators
            const participantsData = [
                {
                    userId: event.creatorId,
                    role: "admin" as const,
                },
                ...event.collaborators.map(collab => ({
                    userId: collab.userId,
                    role: "member" as const,
                })),
            ];

            chatRoom = await prisma.chatRoom.create({
                data: {
                    eventId,
                    name: `Chat: ${event.title}`,
                    description: `Chat room for event: ${event.title}`,
                    participants: {
                        create: participantsData,
                    },
                },
                include: {
                    participants: {
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
                    },
                    _count: {
                        select: {
                            messages: true,
                        },
                    },
                },
            });

            // Create welcome message
            await prisma.chatMessage.create({
                data: {
                    chatRoomId: chatRoom.id,
                    userId: event.creatorId,
                    content: `Welcome to the chat for "${event.title}"! 👋`,
                    messageType: "system",
                },
            });
        }

        // Add current user to participants if not already there
        const isParticipant = chatRoom.participants.some(p => p.userId === currentUserId);
        if (!isParticipant) {
            await prisma.chatRoomParticipant.create({
                data: {
                    chatRoomId: chatRoom.id,
                    userId: currentUserId,
                    role: "member",
                },
            });

            // Update participants list
            chatRoom.participants.push({
                id: 0, // Temporary ID
                chatRoomId: chatRoom.id,
                userId: currentUserId,
                role: "member",
                joinedAt: new Date(),
                isMuted: false,
                user: {
                    id: currentUserId,
                    name: session.user.name || null,
                    email: session.user.email || "",
                    image: session.user.image || null,
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: chatRoom,
        });
    } catch (error) {
        console.error("Chat room error:", error);
        return NextResponse.json(
            { error: "Failed to get chat room" },
            { status: 500 }
        );
    }
}