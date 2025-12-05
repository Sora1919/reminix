"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
    const { data: session } = useSession();

    const initials =
        session?.user?.name?.charAt(0)?.toUpperCase() ||
        session?.user?.email?.charAt(0)?.toUpperCase() ||
        "?";

    return (
        <header className="w-full bg-white shadow px-6 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Dashboard</h1>

            <div className="flex items-center gap-3">
                <span>{session?.user?.name || session?.user?.email}</span>

                <Avatar>
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
