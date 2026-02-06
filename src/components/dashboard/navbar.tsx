"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Navbar() {
    const { data: session } = useSession();

    const initials =
        session?.user?.name?.charAt(0)?.toUpperCase() ||
        session?.user?.email?.charAt(0)?.toUpperCase() ||
        "?";

    return (
        <header className="w-full border-b bg-background px-6 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>

            <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                    {session?.user?.name || session?.user?.email}
                </span>

                <Avatar>
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <NotificationBell />
            </div>
        </header>
    );
}
