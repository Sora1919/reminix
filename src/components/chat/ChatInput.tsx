// components/chat/ChatInput.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
    Send,
    Paperclip,
    Smile,
    Image as ImageIcon,
    X,
    Mic,
    Video,
} from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onFileUpload: (file: File) => void;
    replyTo?: {
        id: number;
        content: string;
        user: {
            name: string | null;
        };
    };
    onCancelReply: () => void;
    isSubmitting: boolean;
    isConnected: boolean;
}

export default function ChatInput({
                                      value,
                                      onChange,
                                      onSubmit,
                                      onFileUpload,
                                      replyTo,
                                      onCancelReply,
                                      isSubmitting,
                                      isConnected,
                                  }: ChatInputProps) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleEmojiClick = (emojiObject: any) => {
        const cursorPosition = textareaRef.current?.selectionStart || 0;
        const newValue =
            value.substring(0, cursorPosition) +
            emojiObject.emoji +
            value.substring(cursorPosition);
        onChange(newValue);
        setShowEmojiPicker(false);

        // Focus back on textarea
        setTimeout(() => {
            textareaRef.current?.focus();
            textareaRef.current?.setSelectionRange(
                cursorPosition + emojiObject.emoji.length,
                cursorPosition + emojiObject.emoji.length
            );
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isSubmitting && isConnected) {
                onSubmit();
            }
        }
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file);
            // Reset input
            e.target.value = "";
        }
    };

    const quickReactions = ["😊", "👍", "❤️", "🎉", "🔥", "👏", "😂", "😮"];

    return (
        <div className="border-t p-4 space-y-3">
            {/* Reply Preview */}
            {replyTo && (
                <div className="flex items-center justify-between bg-muted p-2 rounded-lg">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">
                            Replying to <span className="font-semibold">{replyTo.user.name}</span>
                        </p>
                        <p className="text-sm truncate">{replyTo.content}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onCancelReply}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            {/* Quick Reactions */}
            <div className="flex gap-1 overflow-x-auto pb-2">
                {quickReactions.map((emoji) => (
                    <Button
                        key={emoji}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-lg"
                        onClick={() => onChange(value + emoji)}
                    >
                        {emoji}
                    </Button>
                ))}
            </div>

            {/* Main Input */}
            <div className="flex items-end gap-2">
                {/* File Upload Button */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                onClick={handleFileClick}
                                disabled={!isConnected}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Attach file</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx,.txt,.mp4,.mp3"
                />

                {/* Emoji Picker */}
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            type="button"
                            disabled={!isConnected}
                        >
                            <Smile className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 border-none" align="start">
                        <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            autoFocusSearch={false}
                            theme={Theme.AUTO}
                            skinTonesDisabled
                            searchDisabled={false}
                            previewConfig={{
                                showPreview: false,
                            }}
                            width="100%"
                            height={350}
                        />
                    </PopoverContent>
                </Popover>

                {/* Textarea */}
                <div className="flex-1 relative">
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isConnected ? "Type your message..." : "Connecting..."}
                        className="min-h-[60px] max-h-[120px] resize-none pr-12"
                        disabled={!isConnected || isSubmitting}
                    />
                    <div className="absolute right-2 bottom-2">
                        <Badge variant="secondary" className="text-xs">
                            {value.length}/5000
                        </Badge>
                    </div>
                </div>

                {/* Send Button */}
                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={(!value.trim() && !replyTo) || isSubmitting || !isConnected}
                    size="icon"
                    className="h-12 w-12"
                >
                    {isSubmitting ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    ) : (
                        <Send className="h-5 w-5" />
                    )}
                </Button>
            </div>

            {/* Connection Status */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div
                        className={`h-2 w-2 rounded-full ${
                            isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                        }`}
                    />
                    <span>{isConnected ? "Connected" : "Disconnected"}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="hover:text-foreground transition-colors"
                        onClick={() => onChange(value + " @")}
                    >
                        @ Mention
                    </button>
                    <button
                        type="button"
                        className="hover:text-foreground transition-colors"
                        onClick={() => onChange(value + " :")}
                    >
                        : Emoji
                    </button>
                </div>
            </div>
        </div>
    );
}