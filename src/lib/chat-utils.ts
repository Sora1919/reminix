// lib/chat-utils.ts
import { toast } from "sonner";

export const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
        // Today
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
        // Yesterday
        return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInHours < 168) {
        // Within a week
        return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
        // Older
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
};

export const truncateMessage = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoTypes = ['mp4', 'webm', 'avi', 'mov'];
    const audioTypes = ['mp3', 'wav', 'ogg'];
    const documentTypes = ['pdf', 'doc', 'docx', 'txt'];

    if (imageTypes.includes(extension)) return 'image';
    if (videoTypes.includes(extension)) return 'video';
    if (audioTypes.includes(extension)) return 'audio';
    if (documentTypes.includes(extension)) return 'document';

    return 'file';
};

export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const handleChatError = (error: any) => {
    console.error('Chat error:', error);

    let message = 'An error occurred';

    if (error.message.includes('Network')) {
        message = 'Network error. Please check your connection.';
    } else if (error.message.includes('Unauthorized')) {
        message = 'You need to log in to continue chatting.';
    } else if (error.message.includes('Access denied')) {
        message = 'You no longer have access to this chat.';
    }

    toast.error(message);

    return message;
};