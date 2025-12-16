// components/chat/ChatMessage.tsx
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import {
    Reply, Smile, MoreVertical,
    Image as ImageIcon, FileText,
    Video, Music, Download,
    Trash2, Edit
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
    message: {
        id: number;
        content: string;
        messageType: string;
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
        createdAt: string;
        user: {
            id: number;
            name: string | null;
            email: string;
            image: string | null;
        };
        reactions: Array<{
            id: number;
            emoji: string;
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
    };
    currentUserId: number;
    onReply: (message: any) => void;
    onReact: (messageId: number, emoji: string) => void;
    onDelete?: (messageId: number) => void;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "👏"];

export default function ChatMessage({
                                        message,
                                        currentUserId,
                                        onReply,
                                        onReact,
                                        onDelete,
                                    }: ChatMessageProps) {
    const [showReactions, setShowReactions] = useState(false);
    const isCurrentUser = message.user.id === currentUserId;
    const isSystem = message.messageType === "system";

    // Group reactions by emoji
    const groupedReactions = message.reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction);
        return acc;
    }, {} as Record<string, typeof message.reactions>);

    const getFileIcon = () => {
        switch (message.messageType) {
            case "image":
                return <ImageIcon className="h-4 w-4" />;
            case "pdf":
                return <FileText className="h-4 w-4" />;
            case "video":
                return <Video className="h-4 w-4" />;
            case "audio":
                return <Music className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const renderContent = () => {
        if (isSystem) {
            return (
                <div className="text-center text-muted-foreground italic">
                    {message.content}
                </div>
            );
        }

        if (message.fileUrl) {
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="p-2 bg-background rounded-md">
                            {getFileIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{message.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatFileSize(message.fileSize)}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8"
                        >
                            <a href={message.fileUrl} download target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                    {message.content && (
                        <p className="text-foreground mt-2">{message.content}</p>
                    )}
                </div>
            );
        }

        return <p className="text-foreground whitespace-pre-wrap">{message.content}</p>;
    };

    if (isSystem) {
        return (
            <div className="flex justify-center my-3">
                <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full">
                    {message.content}
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "group flex gap-3 px-4 py-2 hover:bg-muted/50 transition-colors",
            isCurrentUser && "flex-row-reverse"
        )}>
            {/* Avatar - Only show for others */}
            {!isCurrentUser && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={message.user.image || ""} />
                    <AvatarFallback className="text-xs">
                        {message.user.name?.charAt(0) || message.user.email?.charAt(0) || "U"}
                    </AvatarFallback>
                </Avatar>
            )}

            {/* Message Content */}
            <div className={cn(
                "flex-1 max-w-[75%]",
                isCurrentUser && "items-end"
            )}>
                {/* User info for others */}
                {!isCurrentUser && (
                    <p className="text-xs font-medium text-foreground mb-1">
                        {message.user.name || message.user.email}
                    </p>
                )}

                {/* Message bubble */}
                <div className={cn(
                    "relative rounded-2xl px-4 py-3",
                    isCurrentUser
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                )}>
                    {renderContent()}

                    {/* Timestamp */}
                    <div className={cn(
                        "text-xs mt-2",
                        isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                        {format(new Date(message.createdAt), "h:mm a")}
                    </div>

                    {/* Reactions */}
                    {Object.entries(groupedReactions).length > 0 && (
                        <div className={cn(
                            "flex flex-wrap gap-1 mt-2",
                            isCurrentUser ? "justify-end" : "justify-start"
                        )}>
                            {Object.entries(groupedReactions).map(([emoji, reactions]) => (
                                <TooltipProvider key={emoji}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                className={cn(
                                                    "text-xs px-2 py-1 rounded-full border flex items-center gap-1",
                                                    isCurrentUser
                                                        ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                                                        : "bg-background text-foreground border-border"
                                                )}
                                                onClick={() => onReact(message.id, emoji)}
                                            >
                                                <span>{emoji}</span>
                                                <span>{reactions.length}</span>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="text-xs">
                                                {reactions.map(r => r.user.name).join(", ")}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Reactions */}
                <div className={cn(
                    "flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity",
                    isCurrentUser ? "justify-end" : "justify-start"
                )}>
                    {QUICK_REACTIONS.map((emoji) => (
                        <Button
                            key={emoji}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onReact(message.id, emoji)}
                        >
                            <span className="text-sm">{emoji}</span>
                        </Button>
                    ))}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setShowReactions(!showReactions)}
                    >
                        <Smile className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* Message Actions Menu */}
            <div className={cn(
                "opacity-0 group-hover:opacity-100 transition-opacity",
                isCurrentUser ? "self-start" : "self-start"
            )}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isCurrentUser ? "end" : "start"}>
                        <DropdownMenuItem onClick={() => onReply(message)}>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowReactions(true)}>
                            <Smile className="h-4 w-4 mr-2" />
                            React
                        </DropdownMenuItem>
                        {isCurrentUser && (
                            <>
                                <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => onDelete?.(message.id)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}