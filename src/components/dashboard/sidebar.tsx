"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { Home, Calendar, ClipboardList, User } from "lucide-react";

const navItems = [
    { label: "Overview", href: "/dashboard", icon: Home },
    { label: "Events", href: "/events", icon: ClipboardList },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "Profile", href: "/profile", icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground px-4 py-6">
            {/* Logo */}
            <div className="flex items-center gap-3 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-accent">
                    <Image src="/logo.svg" alt="Reminix logo" width={22} height={22} priority />
                </div>

                <div>
                    <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">
                        Reminix
                    </h1>
                    <p className="text-xs text-sidebar-foreground/70">
                        Smart Event Reminder
                    </p>
                </div>
            </div>

            <div className="px-2 pt-4">
                <Badge
                    variant="outline"
                    className="border-sidebar-border bg-sidebar-accent text-sidebar-foreground text-[11px]"
                >
                    Workspace
                </Badge>
            </div>

            <Separator className="my-5 bg-sidebar-border" />

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);

                    return (
                        <Button
                            key={item.href}
                            asChild
                            variant="ghost"
                            className={clsx(
                                "w-full justify-start gap-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                            )}
                        >
                            <Link href={item.href}>
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        </Button>
                    );
                })}
            </nav>

            <Separator className="my-4 bg-sidebar-border" />

            <div className="space-y-2 px-2 text-xs text-sidebar-foreground/70">
                <p>Need to update your account?</p>
                <Link href="/profile" className="text-sidebar-primary hover:underline">
                    Go to profile settings
                </Link>
            </div>
        </aside>
    );
}