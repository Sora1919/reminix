"use client";

import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, MapPin, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface EventCardProps {
    event: {
        id: number;
        title: string;
        description?: string;
        startDate: string;
        endDate: string;
        priority: "LOW" | "MEDIUM" | "HIGH";
        category?: {
            id: number;
            name: string;
        };
        location?: string;
    };
}

function safeFormat(dateString: string) {
    try {
        return format(new Date(dateString), "MMM d, yyyy • h:mm a");
    } catch {
        return dateString;
    }
}

function priorityClass(priority: EventCardProps["event"]["priority"]) {
    switch (priority) {
        case "HIGH":
            return "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400";
        case "MEDIUM":
            return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400";
        case "LOW":
            return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
        default:
            return "";
    }
}

export default function EventCard({ event }: EventCardProps) {
    return (
        <Link href={`/events/${event.id}`} className="group block">
            <Card className="py-4 transition-all hover:shadow-md hover:border-primary/30">
                <CardContent className="space-y-3">
                    {/* Title + Priority */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold">{event.title}</h3>
                            {event.description ? (
                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                    {event.description}
                                </p>
                            ) : (
                                <p className="mt-1 text-sm text-muted-foreground">No description</p>
                            )}
                        </div>

                        <Badge
                            variant="outline"
                            className={cn("uppercase", priorityClass(event.priority))}
                        >
                            {event.priority}
                        </Badge>
                    </div>

                    {/* Meta */}
                    <div className="grid gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span className="line-clamp-1">
                {safeFormat(event.startDate)} — {safeFormat(event.endDate)}
              </span>
                        </div>

                        {event.location ? (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span className="line-clamp-1">{event.location}</span>
                            </div>
                        ) : null}
                    </div>

                    {/* Tags + Action */}
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-wrap gap-2">
                            {event.category ? (
                                <Badge variant="secondary" className="bg-primary/10 text-primary">
                                    {event.category.name}
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="text-muted-foreground">
                                    No category
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground">
                            <span className="hidden sm:inline">View</span>
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}