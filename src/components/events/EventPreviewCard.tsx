"use client";

import { format } from "date-fns";
import {
    AlignLeft,
    Bell,
    CalendarDays,
    Clock,
    MapPin,
    Repeat,
    Tag,
    Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Priority = "LOW" | "MEDIUM" | "HIGH";
type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

function priorityClass(priority: Priority) {
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

function safeFormat(dt?: Date | null, pattern = "EEE, MMM d • h:mm a") {
    if (!dt) return "—";
    try {
        return format(dt, pattern);
    } catch {
        return String(dt);
    }
}

function recurrenceText(enabled: boolean, frequency: Frequency, interval: number) {
    if (!enabled) return "Off";
    const freq =
        frequency === "DAILY"
            ? "Daily"
            : frequency === "WEEKLY"
                ? "Weekly"
                : frequency === "MONTHLY"
                    ? "Monthly"
                    : "Yearly";

    if (interval <= 1) return freq;
    return `${freq} • every ${interval}`;
}

function countEmails(input: string) {
    return input
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean).length;
}

export default function EventPreviewCard(props: {
    className?: string;
    title: string;
    description: string;
    location: string;
    categoryName: string | null;
    priority: Priority;

    startDT: Date | null;
    endDT: Date | null;

    notifyBefore: number;
    recurrenceEnabled: boolean;
    frequency: Frequency;
    interval: number;

    collaboratorEmails: string;
    showCollaborators?: boolean;
}) {
    const {
        className,
        title,
        description,
        location,
        categoryName,
        priority,
        startDT,
        endDT,
        notifyBefore,
        recurrenceEnabled,
        frequency,
        interval,
        collaboratorEmails,
        showCollaborators = true,
    } = props;

    const collabCount = showCollaborators ? countEmails(collaboratorEmails) : 0;

    return (
        <Card className={cn("border-primary/15", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">Preview Summary</CardTitle>

                    <Badge variant="outline" className={cn("uppercase", priorityClass(priority))}>
                        {priority}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="space-y-1">
                    <p className="text-sm font-semibold">
                        {title.trim() ? title : "Untitled Event"}
                    </p>

                    {description.trim() ? (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {description}
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">No description</p>
                    )}
                </div>

                <Separator />

                <div className="grid gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        <span className="line-clamp-1">
              {safeFormat(startDT)} — {safeFormat(endDT)}
            </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <span>{categoryName ?? "No category"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span>Notify: {notifyBefore} minutes before</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Repeat className="h-4 w-4" />
                        <span>{recurrenceText(recurrenceEnabled, frequency, interval)}</span>
                    </div>

                    {location.trim() ? (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{location}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>No location</span>
                        </div>
                    )}

                    {showCollaborators ? (
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                Collaborators: {collabCount > 0 ? collabCount : "None"}
              </span>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}