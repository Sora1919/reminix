"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return (
            <div className="flex justify-center p-10">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        router.push("/login");
        return null;
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold">Hello {session.user?.name}</h1>
        </div>
    );
}
