"use client";

import { Button } from "@/components/ui/button";
import { Plus, Tag, CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickActions() {
    const router = useRouter();

    return (
        <div className="bg-background p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
                <Button className="w-full" onClick={() => router.push("/events/create")}>
                    <Plus size={16} className="mr-2" /> Create Event
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => router.push("/dashboard/categories")}>
                    <Tag size={16} className="mr-2" /> Create Category
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push("/calendar")}>
                    <CalendarPlus size={16} className="mr-2" /> Open Calendar
                </Button>
            </div>
        </div>
    );
}
