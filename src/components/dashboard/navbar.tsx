"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import NotificationBell from "@/components/notifications/NotificationBell";


const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/events": "Events",
    "/calendar": "Calendar",
    "/profile": "Profile",
};

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const initials =
        session?.user?.name?.charAt(0)?.toUpperCase() ||
        session?.user?.email?.charAt(0)?.toUpperCase() ||
        "?";

    const activeTitle =
        Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))
            ?.[1] ?? "Dashboard";

    return (
        <header className="w-full border-b bg-background px-6 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">{activeTitle}</h1>

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
