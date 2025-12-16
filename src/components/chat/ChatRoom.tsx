// components/chat/ChatRoom.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Send, Paperclip, Smile, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ChatRoom() {
    const { id } = useParams();
    const { data: session } = useSession();
    const eventId = parseInt(id as string);

    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load initial messages
    useEffect(() => {
        loadMessages();
    }, [eventId]);

    const loadMessages = async () => {
        try {
            const response = await fetch(`/api/events/${eventId}/chat/messages`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setMessages(data.data.reverse()); // Reverse to show newest at bottom
                }
            }
        } catch (error) {
            console.error("Failed to load messages:", error);
            toast.error("Failed to load messages");
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !session?.user?.id) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/events/${eventId}/chat/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newMessage.trim() }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const data = await response.json();

            // Add new message to list
            setMessages(prev => [...prev, data.data]);
            setNewMessage("");

            // Scroll to bottom
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);

        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message:");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[500px]">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">No messages yet</h3>
                            <p className="text-muted-foreground">Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex gap-3",
                                    message.user.id === parseInt(session?.user?.id || "0")
                                        ? "flex-row-reverse"
                                        : ""
                                )}
                            >
                                {/* Avatar (only for others) */}
                                {message.user.id !== parseInt(session?.user?.id || "0") && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={message.user.image || ""} />
                                        <AvatarFallback>
                                            {message.user.name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                )}

                                {/* Message Bubble */}
                                <div
                                    className={cn(
                                        "max-w-[70%] rounded-2xl px-4 py-2",
                                        message.user.id === parseInt(session?.user?.id || "0")
                                            ? "bg-primary text-primary-foreground rounded-br-sm"
                                            : "bg-muted rounded-bl-sm"
                                    )}
                                >
                                    {/* User name (only for others) */}
                                    {message.user.id !== parseInt(session?.user?.id || "0") && (
                                        <p className="text-xs font-semibold mb-1">
                                            {message.user.name || "Unknown"}
                                        </p>
                                    )}

                                    {/* Message content */}
                                    <p className="whitespace-pre-wrap">{message.content}</p>

                                    {/* Timestamp */}
                                    <p
                                        className={cn(
                                            "text-xs mt-1",
                                            message.user.id === parseInt(session?.user?.id || "0")
                                                ? "text-primary-foreground/70"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {format(new Date(message.createdAt), "h:mm a")}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4">
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" type="button">
                        <Paperclip className="h-4 w-4" />
                    </Button>

                    <div className="flex-1 relative">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type your message..."
                            className="pr-12"
                            disabled={isSubmitting}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-7 w-7"
                            type="button"
                        >
                            <Smile className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || isSubmitting}
                        size="icon"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}