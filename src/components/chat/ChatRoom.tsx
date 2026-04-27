// src/components/chat/ChatRoom.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { format } from "date-fns";
import {
    AlertCircle,
    CheckCircle,
    Download,
    Edit,
    File as FileIcon,
    Flame,
    Frown,
    Heart,
    HeartHandshake,
    Image as ImageIcon,
    Laugh,
    Loader2,
    Music,
    Paperclip,
    PartyPopper,
    Reply,
    Send,
    Smile,
    SmileIcon,
    ThumbsUp,
    Trash2,
    Upload,
    X,
    ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Quick reactions row + quick picker
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

// Basic file handling (uses your existing /api/upload)
const FILE_CONFIG = {
    image: {
        extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
        icon: ImageIcon,
        label: "Image",
        maxSize: 4 * 1024 * 1024,
    },
    pdf: {
        extensions: [".pdf"],
        icon: FileIcon,
        label: "PDF",
        maxSize: 16 * 1024 * 1024,
    },
    document: {
        extensions: [".doc", ".docx", ".txt", ".rtf"],
        icon: FileIcon,
        label: "Document",
        maxSize: 8 * 1024 * 1024,
    },
    video: {
        extensions: [".mp4", ".webm", ".mov", ".avi"],
        icon: FileIcon,
        label: "Video",
        maxSize: 32 * 1024 * 1024,
    },
    audio: {
        extensions: [".mp3", ".wav", ".ogg", ".m4a"],
        icon: Music,
        label: "Audio",
        maxSize: 16 * 1024 * 1024,
    },
    other: {
        extensions: [] as string[],
        icon: FileIcon,
        label: "File",
        maxSize: 8 * 1024 * 1024,
    },
};

type UploadStatus = "pending" | "uploading" | "success" | "error";

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

interface UploadFile {
    id: string;
    name: string;
    size: number;
    type: string;
    progress: number;
    status: UploadStatus;
    error?: string;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getFileType(fileName: string) {
    const dot = fileName.lastIndexOf(".");
    const ext = dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
    for (const [type, config] of Object.entries(FILE_CONFIG)) {
        if (config.extensions.includes(ext)) return type;
    }
    return "other";
}

function validateFile(file: File) {
    const type = getFileType(file.name);
    const config =
        FILE_CONFIG[type as keyof typeof FILE_CONFIG] ?? FILE_CONFIG.other;

    if (file.size > config.maxSize) {
        return {
            valid: false,
            error: `File size exceeds ${formatFileSize(config.maxSize)} limit`,
        };
    }
    return { valid: true as const };
}

function groupReactions(reactions: Reaction[]) {
    return reactions.reduce((acc, r) => {
        (acc[r.emoji] ||= []).push(r);
        return acc;
    }, {} as Record<string, Reaction[]>);
}

export default function ChatRoom() {
    const { id } = useParams();
    const { data: session } = useSession();

    const eventId = Number(id);
    const currentUserId = Number(session?.user?.id || 0);

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState("");

    const [replyTo, setReplyTo] = useState<Message | null>(null);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showReactionsPicker, setShowReactionsPicker] = useState<number | null>(
        null
    );

    const [showFileUpload, setShowFileUpload] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editInputRef = useRef<HTMLTextAreaElement>(null);

    const scrollWrapRef = useRef<HTMLDivElement | null>(null);
    const viewportRef = useRef<HTMLDivElement | null>(null);

    const [showScrollDown, setShowScrollDown] = useState(false);
    const isNearBottomRef = useRef(true);

    const scrollToBottom = (smooth = true) => {
        const v = viewportRef.current;

        if (v) {
            v.scrollTo({
                top: v.scrollHeight,
                behavior: smooth ? "smooth" : "auto",
            });
            return;
        }

        // fallback if viewport not found
        messagesEndRef.current?.scrollIntoView({
            behavior: smooth ? "smooth" : "auto",
        });
    };

    const loadMessages = async () => {
        try {
            const res = await fetch(`/api/events/${eventId}/chat/messages`);
            if (!res.ok) throw new Error("Failed to load");
            const json = await res.json();

            if (json?.success && Array.isArray(json.data)) {
                // Your API returns newest-first, so reverse to show oldest-first
                setMessages(json.data.reverse());
            } else {
                setMessages([]);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to load messages");
        } finally {
            setIsLoading(false);
            scrollToBottom(false);
        }
    };

    useEffect(() => {
        if (!Number.isFinite(eventId)) return;
        setIsLoading(true);
        loadMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    useEffect(() => {
        if (editingMessageId && editInputRef.current) editInputRef.current.focus();
    }, [editingMessageId]);

    useEffect(() => {
        if (isLoading) return;

        // ✅ only auto-scroll if user is already near bottom
        if (isNearBottomRef.current) {
            scrollToBottom(true);
        } else {
            setShowScrollDown(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages.length]);

    useEffect(() => {
        const wrap = scrollWrapRef.current;
        if (!wrap) return;

        const viewport = wrap.querySelector(
            '[data-slot="scroll-area-viewport"]'
        ) as HTMLDivElement | null;

        if (!viewport) return;

        viewportRef.current = viewport;

        const onScroll = () => {
            const v = viewportRef.current;
            if (!v) return;

            const distanceFromBottom = v.scrollHeight - v.scrollTop - v.clientHeight;
            const nearBottom = distanceFromBottom < 80; // threshold

            isNearBottomRef.current = nearBottom;
            setShowScrollDown(!nearBottom);
        };

        onScroll(); // init
        viewport.addEventListener("scroll", onScroll, { passive: true });

        return () => viewport.removeEventListener("scroll", onScroll);
    }, []);

    const sendMessage = async (
        content: string,
        messageType = "text",
        fileData?: { url: string; name: string; size: number }
    ) => {
        if (!content.trim() && !fileData) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/events/${eventId}/chat/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: content.trim(),
                    messageType,
                    fileUrl: fileData?.url,
                    fileName: fileData?.name,
                    fileSize: fileData?.size,
                    // replyToId: replyTo?.id,  // only add if your backend supports it
                }),
            });

            if (!res.ok) throw new Error("Failed to send message");

            const json = await res.json();
            if (json?.data) {
                setMessages((prev) => [...prev, json.data]);
            }

            if (!fileData) setNewMessage("");
            setReplyTo(null);
        } catch (e) {
            console.error(e);
            toast.error("Failed to send message");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSend = () => sendMessage(newMessage);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== "Enter") return;
        if (e.shiftKey) return;

        e.preventDefault();

        if (editingMessageId) {
            handleEditMessage(editingMessageId);
            return;
        }

        handleSend();
    };

    const uploadFileToServer = async (uploadFile: UploadFile, file: File) => {
        const fileType = getFileType(file.name);

        try {
            setUploadFiles((prev) =>
                prev.map((f) =>
                    f.id === uploadFile.id
                        ? { ...f, status: "uploading", progress: 25 }
                        : f
                )
            );

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || "Upload failed");
            }

            const json = await res.json(); // expects { url }
            setUploadFiles((prev) =>
                prev.map((f) =>
                    f.id === uploadFile.id
                        ? { ...f, status: "success", progress: 100 }
                        : f
                )
            );

            await sendMessage(newMessage, fileType, {
                url: json.url,
                name: file.name,
                size: file.size,
            });

            setNewMessage("");

            toast.success(`Uploaded ${file.name}`);
            setTimeout(() => {
                setUploadFiles((prev) => prev.filter((f) => f.id !== uploadFile.id));
            }, 2500);
        } catch (e) {
            console.error(e);
            const msg = e instanceof Error ? e.message : "Upload failed";
            setUploadFiles((prev) =>
                prev.map((f) =>
                    f.id === uploadFile.id ? { ...f, status: "error", error: msg } : f
                )
            );
            toast.error(`Upload failed: ${msg}`);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const batch: UploadFile[] = [];
        const selected = Array.from(files);

        selected.forEach((file, idx) => {
            const valid = validateFile(file);
            if (!valid.valid) {
                toast.error(`${file.name}: ${valid.error}`);
                return;
            }

            batch.push({
                id: `${Date.now()}-${idx}`,
                name: file.name,
                size: file.size,
                type: getFileType(file.name),
                progress: 0,
                status: "pending",
            });
        });

        if (batch.length > 0) {
            setUploadFiles((prev) => [...prev, ...batch]);
            toast.info(`Uploading ${batch.length} file${batch.length > 1 ? "s" : ""}...`);

            batch.forEach((u, index) => {
                const file = selected[index];
                if (file) uploadFileToServer(u, file);
            });
        }

        e.target.value = "";
    };

    const handleReaction = async (messageId: number, emoji: string) => {
        try {
            const res = await fetch(`/api/events/${eventId}/chat/reactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId, emoji }),
            });

            if (!res.ok) throw new Error("Failed to react");

            const json = await res.json();
            // expects data.data.reactions
            const updated = json?.data?.reactions;

            if (updated) {
                setMessages((prev) =>
                    prev.map((m) => (m.id === messageId ? { ...m, reactions: updated } : m))
                );
            }

            setShowReactionsPicker(null);
        } catch (e) {
            console.error(e);
            toast.error("Failed to add reaction");
        }
    };

    const startEditing = (message: Message) => {
        setEditingMessageId(message.id);
        setEditContent(message.content);
    };

    const cancelEditing = () => {
        setEditingMessageId(null);
        setEditContent("");
    };

    const handleEditMessage = async (messageId: number) => {
        if (!editContent.trim()) return;

        try {
            const res = await fetch(
                `/api/events/${eventId}/chat/messages/${messageId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: editContent.trim() }),
                }
            );

            if (!res.ok) throw new Error("Failed to edit");

            const json = await res.json();
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === messageId ? { ...m, ...json.data, isEdited: true } : m
                )
            );

            toast.success("Edited");
            cancelEditing();
        } catch (e) {
            console.error(e);
            toast.error("Failed to edit message");
        }
    };

    const handleDeleteMessage = async (messageId: number) => {
        // Keeps your app working without adding extra UI dependencies.
        // (If you want, we can replace this confirm with AlertDialog later)
        if (!confirm("Delete this message?")) return;

        try {
            const res = await fetch(
                `/api/events/${eventId}/chat/messages/${messageId}`,
                { method: "DELETE" }
            );

            if (!res.ok) throw new Error("Failed to delete");

            setMessages((prev) =>
                prev.map((m) =>
                    m.id === messageId
                        ? { ...m, isDeleted: true, content: "This message was deleted" }
                        : m
                )
            );

            toast.success("Deleted");
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete message");
        }
    };

    const renderFileMessage = (message: Message) => {
        if (!message.fileUrl || !message.fileName) return null;

        const type = message.messageType || "other";
        const config =
            FILE_CONFIG[type as keyof typeof FILE_CONFIG] ?? FILE_CONFIG.other;
        const Icon = config.icon;

        const onDownload = (e: React.MouseEvent) => {
            e.preventDefault();
            const a = document.createElement("a");
            a.href = message.fileUrl!;
            a.download = message.fileName!;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        return (
            <div className="mt-2">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-background/70 p-3">
                    <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center gap-3 min-w-0"
                    >
                        <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                            <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{message.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatFileSize(message.fileSize || 0)} • {config.label}
                            </p>
                        </div>
                    </a>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl"
                        onClick={onDownload}
                        title="Download"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderReactions = (message: Message) => {
        const grouped = groupReactions(message.reactions || []);
        const entries = Object.entries(grouped);
        if (entries.length === 0) return null;

        return (
            <div
                className={cn(
                    "mt-2 flex flex-wrap gap-1",
                    message.userId === currentUserId ? "justify-end" : "justify-start"
                )}
            >
                {entries.map(([emoji, list]) => {
                    const userReacted = list.some((r) => r.userId === currentUserId);
                    return (
                        <button
                            key={emoji}
                            className={cn(
                                "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition hover:scale-[1.02]",
                                userReacted
                                    ? "border-primary/30 bg-primary/15 text-primary"
                                    : "border-border bg-background/70 text-muted-foreground"
                            )}
                            onClick={() => handleReaction(message.id, emoji)}
                        >
                            <span className="text-sm leading-none">{emoji}</span>
                            <span className="font-medium">{list.length}</span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderUploadPreview = () => {
        if (uploadFiles.length === 0) return null;

        return (
            <div className="border-t bg-muted/20 p-3 md:p-4">
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">Uploading…</p>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl"
                        onClick={() => setUploadFiles([])}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-2">
                    {uploadFiles.map((f) => {
                        const statusIcon =
                            f.status === "success" ? (
                                <CheckCircle className="h-5 w-5" />
                            ) : f.status === "error" ? (
                                <AlertCircle className="h-5 w-5" />
                            ) : (
                                <Upload className="h-5 w-5" />
                            );

                        return (
                            <div
                                key={f.id}
                                className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
                            >
                                <div
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-xl",
                                        f.status === "success"
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                            : f.status === "error"
                                                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                                : "bg-primary/10 text-primary"
                                    )}
                                >
                                    {statusIcon}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="truncate text-sm font-medium">{f.name}</p>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                      {formatFileSize(f.size)}
                    </span>
                                    </div>

                                    {f.status === "uploading" && (
                                        <Progress value={f.progress} className="mt-2 h-2" />
                                    )}

                                    {f.status === "error" && f.error && (
                                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                            {f.error}
                                        </p>
                                    )}

                                    {f.status === "success" && (
                                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                                            Uploaded
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // ---------- UI ----------
    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            {/* Messages */}
            <div ref={scrollWrapRef} className="relative flex-1 min-h-0">
                <ScrollArea className="h-full">
                    <div className="min-h-full space-y-3 p-3 md:p-5 flex flex-col justify-end">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                    <Send className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">No messages yet</h3>
                                <p className="text-sm text-muted-foreground">
                                    Start the conversation with your collaborators.
                                </p>
                            </div>
                        ) : (
                            messages.map((message) => {
                                const isMe = message.userId === currentUserId;

                                return (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            "group flex items-end gap-2 rounded-xl p-2 transition-colors hover:bg-muted/30",
                                            isMe ? "flex-row-reverse" : ""
                                        )}
                                    >
                                        {/* Avatar */}
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarImage src={message.user.image || ""} />
                                            <AvatarFallback>
                                                {(message.user.name?.[0] || message.user.email?.[0] || "U")
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Bubble column */}
                                        <div
                                            className={cn(
                                                "max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]",
                                                isMe ? "text-right" : "text-left"
                                            )}
                                        >
                                            {!isMe && (
                                                <p className="mb-1 text-xs font-semibold text-foreground/90">
                                                    {message.user.name || message.user.email}
                                                </p>
                                            )}

                                            {/* Bubble */}
                                            <div
                                                className={cn(
                                                    "inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm break-words",
                                                    isMe
                                                        ? "bg-primary text-primary-foreground rounded-br-sm"
                                                        : "border border-border bg-muted rounded-bl-sm"
                                                )}
                                            >
                                                {editingMessageId === message.id ? (
                                                    <div className="space-y-2">
                                                        <Textarea
                                                            ref={editInputRef}
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            onKeyDown={handleKeyDown}
                                                            className="min-h-[72px] resize-none rounded-xl bg-background text-foreground"
                                                        />
                                                        <div
                                                            className={cn(
                                                                "flex gap-2",
                                                                isMe ? "justify-end" : "justify-start"
                                                            )}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="rounded-xl"
                                                                onClick={cancelEditing}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="rounded-xl"
                                                                onClick={() => handleEditMessage(message.id)}
                                                            >
                                                                Save
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="whitespace-pre-wrap break-words">
                                                            {message.isDeleted
                                                                ? "This message was deleted"
                                                                : message.content}
                                                        </p>
                                                        {renderFileMessage(message)}
                                                    </>
                                                )}
                                            </div>

                                            {/* Reactions */}
                                            {!message.isDeleted && renderReactions(message)}

                                            {/* Meta + actions */}
                                            <div
                                                className={cn(
                                                    "mt-1 flex items-center gap-2",
                                                    isMe ? "justify-end" : "justify-start"
                                                )}
                                            >
                          <span className="text-[11px] text-muted-foreground">
                            {format(new Date(message.createdAt), "h:mm a")}
                              {message.isEdited ? " • edited" : ""}
                          </span>

                                                {!message.isDeleted && (
                                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                                                        {/* quick reactions */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-xl"
                                                                    title="React"
                                                                >
                                                                    <Smile className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align={isMe ? "end" : "start"}>
                                                                <div className="grid grid-cols-4 gap-1 p-2">
                                                                    {QUICK_REACTIONS.map((r) => (
                                                                        <Button
                                                                            key={r.emoji}
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-9 w-9 rounded-xl"
                                                                            onClick={() =>
                                                                                handleReaction(message.id, r.emoji)
                                                                            }
                                                                            title={r.label}
                                                                        >
                                                                            <span className="text-lg">{r.emoji}</span>
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                                <DropdownMenuItem
                                                                    className="justify-center"
                                                                    onClick={() => setShowReactionsPicker(message.id)}
                                                                >
                                                                    More reactions…
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-xl"
                                                            onClick={() => setReplyTo(message)}
                                                            title="Reply"
                                                        >
                                                            <Reply className="h-4 w-4" />
                                                        </Button>

                                                        {isMe && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-xl"
                                                                    onClick={() => startEditing(message)}
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-xl text-destructive hover:text-destructive"
                                                                    onClick={() => handleDeleteMessage(message.id)}
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {showScrollDown && (
                    <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-4 right-4 z-20 rounded-full shadow-md"
                        onClick={() => scrollToBottom(true)}
                        aria-label="Scroll to bottom"
                        title="Scroll to latest"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Upload preview */}
            {renderUploadPreview()}

            {/* Reply preview */}
            {replyTo && (
                <div className="border-t bg-muted/20 px-3 py-2 md:px-4 shrink-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground">
                                Replying to {replyTo.user.name || replyTo.user.email}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {replyTo.content}
                            </p>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl shrink-0"
                            onClick={() => setReplyTo(null)}
                            title="Cancel reply"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Reactions picker */}
            {showReactionsPicker && (
                <Popover
                    open={!!showReactionsPicker}
                    onOpenChange={(open) => !open && setShowReactionsPicker(null)}
                >
                    <PopoverContent className="w-[320px] max-w-[92vw] p-0" align="center">
                        <EmojiPicker
                            onEmojiClick={(emojiObject) => {
                                if (showReactionsPicker) {
                                    handleReaction(showReactionsPicker, emojiObject.emoji);
                                }
                            }}
                            autoFocusSearch={false}
                            theme={Theme.AUTO}
                            width="100%"
                            height={360}
                            skinTonesDisabled
                        />
                    </PopoverContent>
                </Popover>
            )}

            {/* Composer */}
            <div className="border-t bg-background p-3 md:p-4">
                {/* Optional file upload area */}
                {showFileUpload && (
                    <div className="mb-3 rounded-xl border-2 border-dashed border-primary/25 bg-muted/20 p-4 text-center">
                        <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">Upload files</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Max size depends on type (up to 32MB).
                        </p>

                        <div className="mt-3 flex justify-center">
                            <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Browse files
                            </Button>
                        </div>
                    </div>
                )}

                {/* hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept="*/*"
                    onChange={handleFileSelect}
                />

                <div className="flex flex-col gap-2 md:flex-row md:items-end">
                    {/* left controls */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0 rounded-xl"
                            type="button"
                            onClick={() => setShowFileUpload((p) => !p)}
                            disabled={isSubmitting}
                            title="Attach"
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>

                        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 shrink-0 rounded-xl"
                                    type="button"
                                    disabled={isSubmitting}
                                    title="Emoji"
                                >
                                    <Smile className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[320px] max-w-[92vw] p-0" align="start">
                                <EmojiPicker
                                    onEmojiClick={(emojiObject) => {
                                        setNewMessage((prev) => prev + emojiObject.emoji);
                                        setShowEmojiPicker(false);
                                    }}
                                    autoFocusSearch={false}
                                    theme={Theme.AUTO}
                                    width="100%"
                                    height={360}
                                    skinTonesDisabled
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* textarea */}
                    <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message…"
                        className="min-h-[56px] max-h-[160px] resize-none rounded-xl md:flex-1"
                        disabled={isSubmitting}
                    />

                    {/* send */}
                    <Button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || isSubmitting}
                        className="h-10 rounded-xl md:h-10 md:w-12"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* quick reactions row */}
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {QUICK_REACTIONS.map((r) => (
                        <Button
                            key={r.emoji}
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 shrink-0 rounded-xl text-lg"
                            onClick={() => setNewMessage((prev) => prev + r.emoji)}
                            title={r.label}
                            type="button"
                        >
                            {r.emoji}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}