"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import {
    Home,
    Calendar,
    ClipboardList,
    User,
    LogOut,
    Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
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
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-64 p-4">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-6">
                    <Image src="/logo.png" alt="Reminix" width={36} height={36} />
                    <span className="text-lg font-bold">Reminix</span>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);

                        return (
                            <Button
                                key={item.href}
                                asChild
                                variant={isActive ? "secondary" : "ghost"}
                                className={clsx("w-full justify-start gap-3")}
                            >
                                <Link href={item.href}>
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            </Button>
                        );
                    })}
                </nav>

                <Separator className="my-4" />

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </SheetContent>
        </Sheet>
    );
}
