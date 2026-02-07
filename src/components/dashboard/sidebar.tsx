"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

import {
  Home,
  Calendar,
  ClipboardList,
  User,
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

        <div className="px-2 pt-4">
            <Badge variant="secondary" className="text-[11px]">
                Workspace
            </Badge>
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

        <div className="space-y-2 px-2 text-xs text-muted-foreground">
            <p>Need to update your account?</p>
            <Link href="/profile" className="text-primary hover:underline">
                Go to profile settings
            </Link>
        </div>

    </aside>
  );
}
