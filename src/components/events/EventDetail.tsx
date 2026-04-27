"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
    ArrowLeft,
    Bell,
    CalendarDays,
    Clock,
    Loader2,
    MapPin,
    MessageSquare,
    SquarePen,
    Trash2,
    Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function safeFormat(dateValue?: string) {
    if (!dateValue) return "—";
    try {
        return format(new Date(dateValue), "MMM d, yyyy • h:mm a");
    } catch {
        return dateValue;
    }
}

function priorityBadgeClass(priority?: string) {
    switch (priority) {
        case "HIGH":
            return "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400";
        case "MEDIUM":
            return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400";
        case "LOW":
            return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
        default:
            return "border-border text-muted-foreground";
    }
}

export default function EventDetail({ id }: { id: string }) {
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        async function fetchEvent() {
            try {
                const res = await fetch(`/api/events/${id}`);
                if (!res.ok) throw new Error("Failed to load");
                const data = await res.json();
                setEvent(data);
            } catch {
                toast("Failed to load event");
            } finally {
                setLoading(false);
            }
        }

        if (id) fetchEvent();
    }, [id]);

    async function handleDelete() {
        try {
            setDeleting(true);

            const res = await fetch(`/api/events/${id}`, { method: "DELETE" });

            if (!res.ok) {
                toast("Failed to delete event");
                setDeleting(false);
                return;
            }

            toast("Event deleted!");
            setDeleteOpen(false);
            router.push("/events");
        } catch {
            toast("Error deleting event");
        } finally {
            setDeleting(false);
        }
    }

    const collaboratorNames = useMemo(() => {
        const arr = event?.collaborators ?? [];
        return arr
            .map((c: any) => c?.user?.name || c?.user?.email)
            .filter(Boolean);
    }, [event]);

    // ✅ Loading UI (dark-mode safe)
    if (loading) {
        return (
            <div className="mx-auto w-full max-w-5xl p-4 md:p-8">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24" />
                </div>

                <Card className="mt-6">
                    <CardHeader className="space-y-2">
                        <Skeleton className="h-9 w-2/3" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-28 rounded-full" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="mx-auto w-full max-w-3xl p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Event not found</h2>
                        <p className="text-sm text-muted-foreground">
                            The event may have been deleted or you don’t have access.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push("/events")}>Back to Events</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-5xl p-4 md:p-8 space-y-6">
            {/* Back */}
            <Button
                variant="ghost"
                className="gap-2 px-2"
                onClick={() => router.push("/events")}
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>

            <Card>
                <CardHeader className="space-y-3">
                    {/* Title + Actions */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                {event.title}
                            </h1>

                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className={priorityBadgeClass(event.priority)}>
                                    Priority: {event.priority}
                                </Badge>

                                {event.category?.name ? (
                                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                                        {event.category.name}
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-muted-foreground">
                                        No category
                                    </Badge>
                                )}
                            </div>

                            {event.description ? (
                                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                                    {event.description}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">No description</p>
                            )}
                        </div>

                        {/* ✅ Fix mobile overflow: grid buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto lg:min-w-[360px]">
                            <Button
                                className="w-full gap-2"
                                onClick={() => router.push(`/events/${event.id}/edit`)}
                            >
                                <SquarePen className="h-4 w-4" />
                                Edit
                            </Button>

                            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. The event will be permanently removed.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            disabled={deleting}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            {deleting ? "Deleting..." : "Yes, delete"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            {collaboratorNames.length > 0 ? (
                                <Button asChild variant="outline" className="w-full gap-2">
                                    <Link href={`/events/${id}/chat`}>
                                        <MessageSquare className="h-4 w-4" />
                                        Open Chat
                                    </Link>
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={() => router.push(`/events/${event.id}/edit`)}
                                >
                                    <Users className="h-4 w-4" />
                                    Invite collaborators
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Separator />

                    {/* Details blocks (responsive) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-border p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <CalendarDays className="h-4 w-4 text-primary" />
                                <span className="font-medium">Start</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{safeFormat(event.startDate)}</p>

                            <div className="pt-2 flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-medium">End</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{safeFormat(event.endDate)}</p>
                        </div>

                        <div className="rounded-xl border border-border p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span className="font-medium">Location</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {event.location ? event.location : "No location"}
                            </p>

                            <div className="pt-2 flex items-center gap-2 text-sm">
                                <Bell className="h-4 w-4 text-primary" />
                                <span className="font-medium">Reminder</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {event.notifyBefore ? `Notify ${event.notifyBefore} minutes before` : "No reminder"}
                            </p>
                        </div>
                    </div>

                    {/* Collaborators */}
                    <div className="rounded-xl border border-border p-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="font-medium">Collaborators</span>
                        </div>

                        <div className="mt-3">
                            {collaboratorNames.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {collaboratorNames.map((name: string, idx: number) => (
                                        <Badge key={idx} variant="secondary">
                                            {name}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No collaborators</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}