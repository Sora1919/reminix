"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { Home, Calendar, ClipboardList, User, LogOut, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import clsx from "clsx";

const navItems = [
    { label: "Overview", href: "/dashboard", icon: Home },
    { label: "Events", href: "/events", icon: ClipboardList },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "Profile", href: "/profile", icon: User },
];

export default function MobileSidebar() {
    const pathname = usePathname();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open menu"
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>

            <SheetContent
                side="left"
                className="w-64 p-4 bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
            >
                {/* ✅ Required for accessibility (but hidden visually) */}
                <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>

                {/* Logo */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-accent">
                        <Image src="/logo.svg" alt="Reminix" width={22} height={22} />
                    </div>
                    <div>
                        <div className="text-lg font-bold">Reminix</div>
                        <div className="text-xs text-sidebar-foreground/70">
                            Smart Event Reminder
                        </div>
                    </div>
                </div>

                <nav className="space-y-1">
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

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:bg-sidebar-accent"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </SheetContent>
        </Sheet>
    );
}