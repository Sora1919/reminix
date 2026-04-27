"use client";

import { useRouter } from "next/navigation";
import { CalendarPlus, ListChecks, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuickActions() {
    const router = useRouter();

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
                <Button className="w-full" onClick={() => router.push("/events/create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                </Button>

                {/* ✅ Replace Create Category with View Events */}
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/events")}
                >
                    <ListChecks className="mr-2 h-4 w-4" />
                    View Events
                </Button>

                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/calendar")}
                >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Open Calendar
                </Button>
            </CardContent>
        </Card>
    );
}