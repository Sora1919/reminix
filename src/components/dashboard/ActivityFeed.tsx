// src/components/dashboard/ActivityFeed.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ActivityFeed({ items }: { items: { id: number | string; text: string; time?: string }[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {items.map((a) => (
                        <li key={a.id} className="p-3 border rounded">
                            <div className="text-sm">{a.text}</div>
                            <div className="text-xs text-muted-foreground mt-1">{a.time}</div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
