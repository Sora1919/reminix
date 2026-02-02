"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import {
  Home,
  Calendar,
  ClipboardList,
  User,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import clsx from "clsx";
import Image from "next/image";


const navItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Events",
    href: "/events",
    icon: ClipboardList,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-background px-4 py-6">
      {/* Logo */}
        <div className="flex items-center gap-3 px-2">
            <Image
                src="/logo.svg"
            alt="Reminix logo"
            width={60}
            height={60}
            priority
            />
            <div>
                <h1 className="text-xl font-bold tracking-tight">Reminix</h1>
                <p className="text-xs text-muted-foreground">
                Smart Event Reminder
                </p>
            </div>
        </div>


      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className={clsx(
                "w-full justify-start gap-3",
                isActive && "font-medium"
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

      <Separator className="my-4" />

      {/* Logout */}
      <Button
        variant="ghost"
        className="justify-start gap-3 text-destructive hover:text-destructive"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </aside>
  );
}
