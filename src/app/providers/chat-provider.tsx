// app/providers/chat-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

interface ChatMessage {
    id: number;
    content: string;
    messageType: string;
    fileUrl?: string;
    fileName?: string;
    createdAt: string;
    user: {
        id: number;
        name: string | null;
        email: string;
        image: string | null;
    };
}

interface ChatContextType {
    messages: ChatMessage[];
    sendMessage: (chatRoomId: number, content: string, file?: File) => Promise<void>;
    isConnected: boolean;
    joinChat: (chatRoomId: number) => void;
    leaveChat: (chatRoomId: number) => void;
}

const ChatContext = createContext<ChatContextType>({
    messages: [],
    sendMessage: async () => {},
    isConnected: false,
    joinChat: () => {},
    leaveChat: () => {},
});

export const useChat = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [eventSource, setEventSource] = useState<EventSource | null>(null);
    const [currentChatRoom, setCurrentChatRoom] = useState<number | null>(null);

    // Connect to SSE stream
    const joinChat = useCallback((chatRoomId: number) => {
        if (!session?.user?.id || currentChatRoom === chatRoomId) return;

        // Leave previous chat
        if (eventSource) {
            eventSource.close();
            setEventSource(null);
        }

        setCurrentChatRoom(chatRoomId);

        // Create new EventSource connection
        const es = new EventSource(`/api/events/${chatRoomId}/chat/stream`);

        es.onopen = () => {
            console.log("✅ SSE Connected to chat room:", chatRoomId);
            setIsConnected(true);
        };

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case "new_message":
                        setMessages(prev => [data.message, ...prev]);
                        break;
                    case "connected":
                        console.log("User connected:", data.userId);
                        break;
                }
            } catch (error) {
                console.error("Failed to parse SSE message:", error);
            }
        };

        es.onerror = (error) => {
            console.error("❌ SSE Error:", error);
            setIsConnected(false);
            es.close();

            // Attempt reconnect after 3 seconds
            setTimeout(() => {
                if (currentChatRoom === chatRoomId) {
                    joinChat(chatRoomId);
                }
            }, 3000);
        };

        setEventSource(es);

        // Load initial messages
        fetch(`/api/events/${chatRoomId}/chat/messages`)
            .then(res => res.json())
            .then(data => setMessages(data.messages || []))
            .catch(console.error);

    }, [session?.user?.id, currentChatRoom, eventSource]);

    // Leave chat
    const leaveChat = useCallback((chatRoomId: number) => {
        if (eventSource && currentChatRoom === chatRoomId) {
            eventSource.close();
            setEventSource(null);
            setCurrentChatRoom(null);
            setIsConnected(false);
            setMessages([]);
        }
    }, [eventSource, currentChatRoom]);

    // Send message
    const sendMessage = useCallback(async (
        chatRoomId: number,
        content: string,
        file?: File
    ) => {
        if (!session?.user?.id) return;

        let fileUrl: string | undefined;
        let fileName: string | undefined;

        // Handle file upload
        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            try {
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    fileUrl = uploadData.url;
                    fileName = file.name;
                }
            } catch (error) {
                console.error("File upload failed:", error);
            }
        }

        // Send message
        try {
            const res = await fetch(`/api/events/${chatRoomId}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content,
                    messageType: file ? "file" : "text",
                    fileUrl,
                    fileName,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to send message");
            }
        } catch (error) {
            console.error("Send message error:", error);
            throw error;
        }
    }, [session?.user?.id]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [eventSource]);

    return (
        <ChatContext.Provider
            value={{
                messages,
                sendMessage,
                isConnected,
                joinChat,
                leaveChat,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}