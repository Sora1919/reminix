"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Notifications({
                                          items,
                                      }: {
    items: { id: number | string; text: string; time?: string }[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="space-y-2">
                    {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No notifications yet.</p>
                    ) : (
                        items.map((n) => (
                            <div
                                key={n.id}
                                className="p-2 border border-border rounded hover:bg-muted/50 transition-colors"
                            >
                                <div className="text-sm">{n.text}</div>
                                <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}