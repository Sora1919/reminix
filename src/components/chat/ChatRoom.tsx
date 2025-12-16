// components/chat/ChatRoom.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Send,
    Paperclip,
    Smile,
    Loader2,
    Image as ImageIcon,
    FileText,
    Video,
    Music,
    Download,
    Trash2,
    Edit,
    X,
    MoreVertical,
    Reply,
    Heart,
    ThumbsUp,
    Laugh,
    SmileIcon,
    Frown,
    Flame,
    HeartHandshake,
    PartyPopper,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import EmojiPicker, { Theme } from "emoji-picker-react";

// Quick reactions for easy access
const QUICK_REACTIONS = [
    { emoji: "👍", label: "Thumbs Up", icon: ThumbsUp },
    { emoji: "❤️", label: "Heart", icon: Heart },
    { emoji: "😂", label: "Laugh", icon: Laugh },
    { emoji: "😮", label: "Wow", icon: SmileIcon },
    { emoji: "😢", label: "Sad", icon: Frown },
    { emoji: "🔥", label: "Fire", icon: Flame },
    { emoji: "🤝", label: "Clap", icon: HeartHandshake },
    { emoji: "🎉", label: "Party", icon: PartyPopper },
];

interface Reaction {
    id: number;
    emoji: string;
    userId: number;
    user: {
        id: number;
        name: string | null;
        image: string | null;
    };
}

interface Message {
    id: number;
    content: string;
    messageType: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    userId: number;
    user: {
        id: number;
        name: string | null;
        email: string;
        image: string | null;
    };
    reactions: Reaction[];
}

export default function ChatRoom() {
    const { id } = useParams();
    const { data: session } = useSession();
    const eventId = parseInt(id as string);

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState("");
    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showReactionsPicker, setShowReactionsPicker] = useState<number | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editInputRef = useRef<HTMLTextAreaElement>(null);

    // Load initial messages
    useEffect(() => {
        loadMessages();
    }, [eventId]);

    // Focus edit input when editing
    useEffect(() => {
        if (editingMessageId && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingMessageId]);

    const loadMessages = async () => {
        try {
            const response = await fetch(`/api/events/${eventId}/chat/messages`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setMessages(data.data.reverse());
                }
            }
        } catch (error) {
            console.error("Failed to load messages:", error);
            toast.error("Failed to load messages");
        } finally {
            setIsLoading(false);
        }
    };

    // Send message
    const sendMessage = async (content: string, messageType = "text", fileData?: any) => {
        if (!content.trim() && !fileData) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/events/${eventId}/chat/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: content.trim(),
                    messageType,
                    fileUrl: fileData?.url,
                    fileName: fileData?.name,
                    fileSize: fileData?.size,
                }),
            });

            if (!response.ok) throw new Error("Failed to send message");

            const data = await response.json();
            setMessages(prev => [...prev, data.data]);
            setNewMessage("");
            setReplyTo(null);

            scrollToBottom();
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message:");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendMessage = () => {
        sendMessage(newMessage);
    };

    // Handle reactions
    const handleReaction = async (messageId: number, emoji: string) => {
        try {
            const response = await fetch(`/api/events/${eventId}/chat/reactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId, emoji }),
            });

            if (!response.ok) throw new Error("Failed to add reactions");

            const data = await response.json();

            // Update message with new reactions
            setMessages(prev => prev.map(msg => {
                if (msg.id === messageId) {
                    return { ...msg, reactions: data.data.reactions };
                }
                return msg;
            }));

            setShowReactionsPicker(null);
        } catch (error) {
            console.error("Reaction error:", error);
            toast.error("Failed to add reactions");
        }
    };

    // Group reactions by emoji
    const groupReactions = (reactions: Reaction[]) => {
        return reactions.reduce((groups, reaction) => {
            if (!groups[reaction.emoji]) {
                groups[reaction.emoji] = [];
            }
            groups[reaction.emoji].push(reaction);
            return groups;
        }, {} as Record<string, Reaction[]>);
    };

    // Check if current user has reacted with specific emoji
    const hasReacted = (reactions: Reaction[], emoji: string) => {
        const userId = parseInt(session?.user?.id || "0");
        return reactions.some(r => r.emoji === emoji && r.userId === userId);
    };

    // Handle file upload
    const handleFileUpload = async (file: File) => {
        // Your file upload logic here
        toast.info("Uploading file");
    };

    // Edit message
    const handleEditMessage = async (messageId: number) => {
        if (!editContent.trim()) return;

        try {
            const response = await fetch(`/api/events/${eventId}/chat/messages/${messageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editContent.trim() }),
            });

            if (!response.ok) throw new Error("Failed to edit message");

            const data = await response.json();

            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, ...data.data, isEdited: true } : msg
            ));

            setEditingMessageId(null);
            setEditContent("");
            toast.success("Successfully edited");
        } catch (error) {
            console.error("Edit message error:", error);
            toast.error("Failed to edit message");
        }
    };

    // Delete message
    const handleDeleteMessage = async (messageId: number) => {
        if (!confirm("Are you sure you want to delete this message?")) return;

        try {
            const response = await fetch(`/api/events/${eventId}/chat/messages/${messageId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete message");

            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, isDeleted: true, content: "This message was deleted" } : msg
            ));

            toast.success("Successfully deleted");
        } catch (error) {
            console.error("Delete message error:", error);
            toast.error("Failed to delete message");
        }
    };

    const handleEmojiClick = (emojiObject: any) => {
        setNewMessage(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    const startEditing = (message: Message) => {
        setEditingMessageId(message.id);
        setEditContent(message.content);
    };

    const cancelEditing = () => {
        setEditingMessageId(null);
        setEditContent("");
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (editingMessageId) {
                handleEditMessage(editingMessageId);
            } else {
                handleSendMessage();
            }
        }
    };

    const renderReactions = (message: Message) => {
        const grouped = groupReactions(message.reactions);
        const currentUserId = parseInt(session?.user?.id || "0");

        return Object.entries(grouped).map(([emoji, reactions]) => {
            const userReacted = reactions.some(r => r.userId === currentUserId);

            return (
                <TooltipProvider key={emoji}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                className={cn(
                                    "text-xs px-2 py-1 rounded-full border flex items-center gap-1 transition-all hover:scale-105",
                                    userReacted
                                        ? "bg-primary/20 text-primary border-primary/30"
                                        : "bg-background/80 backdrop-blur-sm border-border"
                                )}
                                onClick={() => handleReaction(message.id, emoji)}
                            >
                                <span className="text-sm">{emoji}</span>
                                <span className="font-medium">{reactions.length}</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <div className="text-xs max-w-[200px]">
                                <p className="font-medium mb-1">{emoji} Reacted by:</p>
                                <div className="flex flex-wrap gap-1">
                                    {reactions.slice(0, 5).map(reaction => (
                                        <span key={reaction.id} className="text-xs">
                      {reaction.user.name}
                    </span>
                                    ))}
                                    {reactions.length > 5 && (
                                        <span className="text-xs text-muted-foreground">
                      +{reactions.length - 5} more
                    </span>
                                    )}
                                </div>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[500px] min-h-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 min-h-0">
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <Send className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No messages yet</h3>
                            <p className="text-muted-foreground">Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "group flex gap-3 hover:bg-muted/30 p-2 rounded-lg transition-colors",
                                    message.userId === parseInt(session?.user?.id || "0")
                                        ? "flex-row-reverse"
                                        : ""
                                )}
                            >
                                {/* Avatar */}
                                {message.userId !== parseInt(session?.user?.id || "0") && (
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarImage src={message.user.image || ""} />
                                        <AvatarFallback>
                                            {message.user.name?.charAt(0) || message.user.email?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                )}

                                {/* Message Content */}
                                <div
                                    className={cn(
                                        "max-w-[40%] flex-1",
                                        message.userId === parseInt(session?.user?.id || "0") && "text-right"
                                    )}
                                >
                                    {/* User Info */}
                                    {message.userId !== parseInt(session?.user?.id || "0") && (
                                        <p className="text-xs font-semibold mb-1">
                                            {message.user.name || message.user.email}
                                        </p>
                                    )}

                                    {/* Message Bubble */}
                                    <div
                                        className={cn(
                                            "rounded-2xl px-4 py-2 inline-block",
                                            message.userId === parseInt(session?.user?.id || "0")
                                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                                : "bg-muted rounded-bl-sm"
                                        )}
                                    >
                                        {/* Editing Mode */}
                                        {editingMessageId === message.id ? (
                                            <div className="space-y-2">
                                                <Textarea
                                                    ref={editInputRef}
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    onKeyDown={handleKeyPress}
                                                    className="min-h-[60px] resize-none"
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleEditMessage(message.id)}
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={cancelEditing}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Message Content */}
                                                {!message.isDeleted ? (
                                                    <p className="whitespace-pre-wrap break-words">
                                                        {message.content}
                                                    </p>
                                                ) : (
                                                    <p className="italic text-muted-foreground">
                                                        {message.content}
                                                    </p>
                                                )}

                                                {/* Edited Indicator */}
                                                {message.isEdited && !message.isDeleted && (
                                                    <span className="text-xs opacity-70 ml-2">(edited)</span>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Reactions */}
                                    {message.reactions.length > 0 && (
                                        <div className={cn(
                                            "flex flex-wrap gap-1 mt-2",
                                            message.userId === parseInt(session?.user?.id || "0")
                                                ? "justify-end"
                                                : "justify-start"
                                        )}>
                                            {renderReactions(message)}
                                        </div>
                                    )}

                                    {/* Timestamp & Actions */}
                                    <div className="flex items-center gap-2 mt-1">
                    <span
                        className={cn(
                            "text-xs",
                            message.userId === parseInt(session?.user?.id || "0")
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                        )}
                    >
                      {format(new Date(message.createdAt), "h:mm a")}
                    </span>

                                        {/* Message Actions */}
                                        {!message.isDeleted && (
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                {/* Quick Reactions Dropdown */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                        >
                                                            <Smile className="h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start">
                                                        <div className="grid grid-cols-4 gap-1 p-2">
                                                            {QUICK_REACTIONS.map(({ emoji, label, icon: Icon }) => (
                                                                <Button
                                                                    key={emoji}
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-9 w-9"
                                                                    onClick={() => handleReaction(message.id, emoji)}
                                                                    title={label}
                                                                >
                                                                    <span className="text-lg">{emoji}</span>
                                                                </Button>
                                                            ))}
                                                        </div>
                                                        <DropdownMenuItem
                                                            className="justify-center"
                                                            onClick={() => setShowReactionsPicker(message.id)}
                                                        >
                                                            More reactions...
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => setReplyTo(message)}
                                                >
                                                    <Reply className="h-3 w-3" />
                                                </Button>

                                                {message.userId === parseInt(session?.user?.id || "0") && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => startEditing(message)}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-destructive hover:text-destructive"
                                                            onClick={() => handleDeleteMessage(message.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Avatar for current user */}
                                {message.userId === parseInt(session?.user?.id || "0") && (
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarImage src={message.user.image || ""} />
                                        <AvatarFallback>
                                            {message.user.name?.charAt(0) || message.user.email?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Reactions Picker Popover */}
            {showReactionsPicker && (
                <Popover
                    open={!!showReactionsPicker}
                    onOpenChange={(open) => !open && setShowReactionsPicker(null)}
                >
                    <PopoverContent className="w-80 p-0" align="center">
                        <EmojiPicker
                            onEmojiClick={(emojiObject) => {
                                if (showReactionsPicker) {
                                    handleReaction(showReactionsPicker, emojiObject.emoji);
                                }
                            }}
                            autoFocusSearch={false}
                            theme={Theme.AUTO}
                            searchDisabled={false}
                            skinTonesDisabled
                            width="100%"
                            height={350}
                        />
                    </PopoverContent>
                </Popover>
            )}

            {/* Reply Preview */}
            {replyTo && (
                <div className="border-t px-4 py-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Reply className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                                <span className="font-medium">Replying to {replyTo.user.name}</span>
                                <p className="text-muted-foreground truncate max-w-[300px]">
                                    {replyTo.content}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setReplyTo(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t p-4">
                <div className="flex gap-2">
                    {/* Emoji Picker for Message Input */}
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                disabled={isSubmitting}
                            >
                                <Smile className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 border-none" align="start">
                            <EmojiPicker
                                onEmojiClick={handleEmojiClick}
                                autoFocusSearch={false}
                                theme={Theme.AUTO}
                                width="100%"
                                height={350}
                            />
                        </PopoverContent>
                    </Popover>

                    {/* Message Input */}
                    <div className="flex-1 relative">
                        <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type your message..."
                            className="min-h-[60px] max-h-[120px] resize-none pr-12"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Send Button */}
                    <Button
                        onClick={handleSendMessage}
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

                {/* Quick Reactions for New Message */}
                <div className="flex gap-1 mt-2 overflow-x-auto">
                    {QUICK_REACTIONS.map(({ emoji, label, icon: Icon }) => (
                        <Button
                            key={emoji}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-lg"
                            onClick={() => setNewMessage(prev => prev + emoji)}
                            title={label}
                        >
                            {emoji}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}