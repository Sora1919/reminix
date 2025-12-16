// hooks/use-chat.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface Message {
    id: number;
    content: string;
    messageType: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    createdAt: string;
    updatedAt: string;
    isEdited: boolean;
    isDeleted: boolean;
    userId: number;
    user: {
        id: number;
        name: string | null;
        email: string;
        image: string | null;
    };
    reactions: Array<{
        id: number;
        emoji: string;
        userId: number;
        user: {
            id: number;
            name: string | null;
            image: string | null;
        };
    }>;
    replies?: Array<{
        id: number;
        content: string;
        user: {
            id: number;
            name: string | null;
        };
    }>;
}

interface ChatRoom {
    id: number;
    eventId: number;
    name: string;
    description: string | null;
    participants: Array<{
        id: number;
        userId: number;
        role: string;
        joinedAt: string;
        isMuted: boolean;
        user: {
            id: number;
            name: string | null;
            email: string;
            image: string | null;
        };
    }>;
}

export function useChat(eventId: number) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [participants, setParticipants] = useState<any[]>([]);
    const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [nextCursor, setNextCursor] = useState<number | null>(null);

    const eventSourceRef = useRef<EventSource | null>(null);

    // Initialize chat room
    const initializeChat = useCallback(async () => {
        if (!session?.user?.id) return;

        try {
            const response = await fetch(`/api/events/${eventId}/chat`);
            if (!response.ok) throw new Error("Failed to initialize chat");

            const data = await response.json();
            if (data.success) {
                setChatRoom(data.data);
                setParticipants(data.data.participants || []);

                // Load initial messages
                await loadMessages();

                // Connect to SSE stream
                connectToStream();
            }
        } catch (error) {
            console.error("Failed to initialize chat:", error);
            toast.error("Failed to initialize chat");
        } finally {
            setIsLoading(false);
        }
    }, [eventId, session?.user?.id]);

    // Load messages with pagination
    const loadMessages = useCallback(async (cursor?: number | null) => {
        try {
            const params = new URLSearchParams();
            if (cursor) params.append("cursor", cursor.toString());
            params.append("limit", "50");

            const response = await fetch(
                `/api/events/${eventId}/chat/messages?${params.toString()}`
            );

            if (!response.ok) throw new Error("Failed to load messages");

            const data = await response.json();
            if (data.success) {
                if (cursor) {
                    // Append older messages
                    setMessages(prev => [...data.data, ...prev]);
                } else {
                    // Set initial messages
                    setMessages(data.data);
                }
                setNextCursor(data.pagination.nextCursor);
                setHasMoreMessages(data.pagination.hasMore);
            }
        } catch (error) {
            console.error("Failed to load messages:", error);
        }
    }, [eventId]);

    // Connect to SSE stream
    const connectToStream = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const eventSource = new EventSource(`/api/events/${eventId}/chat/stream`);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            setIsConnected(true);
            console.log("Connected to chat stream");
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case "new_message":
                        setMessages(prev => [data.data, ...prev]);
                        break;

                    case "message_updated":
                        setMessages(prev =>
                            prev.map(msg =>
                                msg.id === data.data.id ? { ...msg, ...data.data } : msg
                            )
                        );
                        break;

                    case "message_deleted":
                        setMessages(prev =>
                            prev.map(msg =>
                                msg.id === data.data.id
                                    ? { ...msg, isDeleted: true, content: "This message was deleted" }
                                    : msg
                            )
                        );
                        break;

                    case "reaction_added":
                        setMessages(prev =>
                            prev.map(msg => {
                                if (msg.id === data.data.messageId) {
                                    const existingReactions = msg.reactions.filter(
                                        r => !(r.userId === data.data.userId && r.emoji === data.data.emoji)
                                    );
                                    return {
                                        ...msg,
                                        reactions: [...existingReactions, data.data],
                                    };
                                }
                                return msg;
                            })
                        );
                        break;

                    case "reaction_removed":
                        setMessages(prev =>
                            prev.map(msg => {
                                if (msg.id === data.data.messageId) {
                                    return {
                                        ...msg,
                                        reactions: msg.reactions.filter(
                                            r => !(r.userId === data.data.userId && r.emoji === data.data.emoji)
                                        ),
                                    };
                                }
                                return msg;
                            })
                        );
                        break;

                    case "participant_joined":
                        setParticipants(prev => [...prev, data.data]);
                        break;

                    case "participant_left":
                        setParticipants(prev =>
                            prev.filter(p => p.userId !== data.data.userId)
                        );
                        break;

                    case "ping":
                        // Keep connection alive
                        break;
                }
            } catch (error) {
                console.error("Error parsing SSE data:", error);
            }
        };

        eventSource.onerror = () => {
            setIsConnected(false);
            console.error("SSE connection error");

            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                if (eventSource.readyState === EventSource.CLOSED) {
                    connectToStream();
                }
            }, 5000);
        };
    }, [eventId]);

    // Send message
    const sendMessage = useCallback(async (data: {
        content: string;
        replyToId?: number;
        messageType?: string;
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
    }) => {
        if (!session?.user?.id) throw new Error("Not authenticated");

        const response = await fetch(`/api/events/${eventId}/chat/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to send message");
        }

        const result = await response.json();
        return result.data;
    }, [eventId, session?.user?.id]);

    // Add reaction
    const addReaction = useCallback(async (messageId: number, emoji: string) => {
        if (!session?.user?.id) throw new Error("Not authenticated");

        const response = await fetch(`/api/events/${eventId}/chat/reactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messageId, emoji }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to add reaction");
        }

        const result = await response.json();
        return result.data;
    }, [eventId, session?.user?.id]);

    // Delete message
    const deleteMessage = useCallback(async (messageId: number) => {
        if (!session?.user?.id) throw new Error("Not authenticated");

        const response = await fetch(`/api/events/${eventId}/chat/messages/${messageId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to delete message");
        }

        return true;
    }, [eventId, session?.user?.id]);

    // Load more messages
    const loadMoreMessages = useCallback(async () => {
        if (nextCursor && hasMoreMessages) {
            await loadMessages(nextCursor);
        }
    }, [nextCursor, hasMoreMessages, loadMessages]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    // Initialize on mount
    useEffect(() => {
        if (session?.user?.id && eventId) {
            initializeChat();
        }
    }, [session?.user?.id, eventId, initializeChat]);

    return {
        messages,
        participants,
        chatRoom,
        isLoading,
        isConnected,
        sendMessage,
        addReaction,
        deleteMessage,
        loadMoreMessages,
        hasMoreMessages,
    };
}