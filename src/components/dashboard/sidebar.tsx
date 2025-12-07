"use client";

import { Home, Calendar, Users, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Sidebar() {
    const router = useRouter();

    return (
        <aside className="w-64 bg-white shadow-md p-5 hidden md:block">
            <h2 className="text-xl font-bold mb-6">Reminix</h2>

            <nav className="space-y-3">
                <Link href="/dashboard" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded">
                    <Home size={18} /> Overview
                </Link>

                <Link href="/events" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded">
                    <Calendar size={18} /> Events
                </Link>

                <Link href="/profile" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded">
                    <Calendar size={18} /> Profiles
                </Link>

                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded w-full text-left text-red-600 mt-10"
                >
                    <LogOut size={18} /> Logout
                </button>
            </nav>
        </aside>
    );
}
