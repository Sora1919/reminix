"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

import MobileSidebar from "@/components/dashboard/MobileSideBar";
import NotificationBell from "@/components/notifications/NotificationBell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
        Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ??
        "Dashboard";

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
            {/* ✅ Mobile menu button (hidden on desktop) */}
            <MobileSidebar />

            <h1 className="text-lg font-semibold text-foreground">{activeTitle}</h1>

            <div className="ml-auto flex items-center gap-3">
                <NotificationBell />

                <span className="hidden md:inline text-sm text-muted-foreground">
          {session?.user?.name || session?.user?.email}
        </span>

                <Avatar>
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}