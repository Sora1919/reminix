// src/components/dashboard/UpcomingEvents.tsx
"use client";

import { format, parseISO } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Event = {
    id: number | string;
    title: string;
    date: string;
    location?: string;
    category?: string;
};

export default function UpcomingEvents({ events }: { events: Event[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    {events.map((e) => {
                        const dt = parseISO(e.date);
                        return (
                            <div key={e.id} className="flex items-start justify-between p-2 border rounded hover:bg-muted/50">
                                <div>
                                    <div className="font-semibold">{e.title}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {format(dt, "eee, MMM d • hh:mm a")} • {e.location ?? "TBA"}
                                    </div>
                                </div>
                                <div className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">{e.category}</div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
