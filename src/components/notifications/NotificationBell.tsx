// components/notifications/NotificationBell.tsx
"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Notification {
    id: number;
    userId: number;
    eventId: number;
    message: string;
    isRead: boolean;
    createdAt: string;
    event?: {
        id: number;
        title: string;
        startDate: string;
    };
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    async function loadNotifications() {
        try {
            setLoading(true);
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setLoading(false);
        }
    }

    async function markAsRead(notificationId: number) {
        try {
            const res = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: notificationId }),
            });

            if (res.ok) {
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notificationId ? { ...n, isRead: true } : n
                    )
                );
                toast.success("Marked as read");
            }
        } catch (error) {
            toast.error("Failed to mark as read");
        }
    }

    async function markAllAsRead() {
        try {
            const unreadNotifications = notifications.filter(n => !n.isRead);

            for (const notification of unreadNotifications) {
                await fetch("/api/notifications", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: notification.id }),
                });
            }

            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
            toast.success("All marked as read");
        } catch (error) {
            toast.error("Failed to mark all as read");
        }
    }

    async function clearRead() {
        try {
            const res = await fetch("/api/notifications", {
                method: "DELETE",
            });

            if (res.ok) {
                setNotifications(prev => prev.filter(n => !n.isRead));
                toast.success("Cleared read notifications");
            }
        } catch (error) {
            toast.error("Failed to clear notifications");
        }
    }

    useEffect(() => {
        loadNotifications();

        // Refresh every 30 seconds
        const interval = setInterval(loadNotifications, 30000);

        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-96 max-h-96 overflow-y-auto">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notifications</span>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                Mark all as read
                            </button>
                        )}
                        <button
                            onClick={clearRead}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            Clear read
                        </button>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {loading ? (
                    <DropdownMenuItem disabled>
                        Loading notifications...
                    </DropdownMenuItem>
                ) : notifications.length === 0 ? (
                    <DropdownMenuItem disabled className="text-gray-500">
                        No notifications yet
                    </DropdownMenuItem>
                ) : (
                    notifications.map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className={`flex flex-col items-start p-3 cursor-pointer ${
                                !notification.isRead ? "bg-blue-50" : ""
                            }`}
                            onClick={() => markAsRead(notification.id)}
                        >
                            <div className="flex justify-between w-full">
                                <span className={`font-medium ${notification.isRead ? "text-gray-600" : "text-gray-900"}`}>
                                    {notification.message}
                                </span>
                                {!notification.isRead && (
                                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                                )}
                            </div>

                            {notification.event && (
                                <span className="text-sm text-gray-500 mt-1">
                                    Event: {notification.event.title}
                                </span>
                            )}

                            <span className="text-xs text-gray-400 mt-2">
                                {new Date(notification.createdAt).toLocaleString()}
                            </span>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}