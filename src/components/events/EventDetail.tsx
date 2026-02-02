"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarDays, MapPin, Bell, Users, ArrowLeft, Clock, Trash2, SquarePen } from "lucide-react";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export default function EventDetail({ id }: { id: string }) {
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvent() {
            try {
                const res = await fetch(`/api/events/${id}`);
                if (!res.ok) throw new Error("Failed to load");

                const data = await res.json();
                setEvent(data);
            } catch {
                toast("Failed to load event");
            }
            setLoading(false);
        }

        if (id) {
            fetchEvent();
        }
    }, [id]);

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            const res = await fetch(`/api/events/${id}`, { method: "DELETE" });

            if (!res.ok) {
                toast("Failed to delete event");
                return;
            }

            toast("Event deleted!");
            router.push("/events");
        } catch {
            toast("Error deleting event");
        }
    }


    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin h-10 w-10 text-green-600" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="text-center p-10">
                <p className="text-gray-600">Event not found.</p>
                <Button onClick={() => router.push("/events")} className="mt-4">
                    Back to Events
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10 space-y-6">
            {/* Back Button */}
            <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => router.push("/events")}
            >
                <ArrowLeft size={18} />
                Back
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">{event.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">

                    {/* Priority & Category */}
                    <div className="flex gap-3">
                        <Badge
                            variant="outline"
                            className={
                                event.priority === "HIGH"
                                    ? "border-red-600 text-red-600"
                                    : event.priority === "MEDIUM"
                                        ? "border-yellow-600 text-yellow-600"
                                        : "border-green-600 text-green-600"
                            }
                        >
                            Priority: {event.priority}
                        </Badge>

                        {event.category?.name && (
                            <Badge className="bg-green-600">{event.category.name}</Badge>
                        )}
                    </div>

                    {/* Description */}
                    {event.description && (
                        <p className="text-gray-700 leading-relaxed">{event.description}</p>
                    )}

                    {/* Dates */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <CalendarDays className="h-5 w-5 text-green-600" />
                            <span>
                                <strong>Start:</strong>{" "}
                                {new Date(event.startDate).toLocaleString()}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-green-600" />
                            <span>
                                <strong>End:</strong>{" "}
                                {new Date(event.endDate).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Location */}
                    {event.location && (
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-green-600" />
                            <span>{event.location}</span>
                        </div>
                    )}

                    {/* Notify Before */}
                    {event.notifyBefore && (
                        <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-green-600" />
                            <span>Notify {event.notifyBefore} minutes before</span>
                        </div>
                    )}

                    {/* Collaborators */}
                    {event.collaborators?.length > 0 && (
                        <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-green-600" />
                            <span>
                                Collaborators:
                                <strong>
                                    {" "}
                                    {event.collaborators
                                        .map((c: any) => c.user.name)
                                        .join(", ")}
                                </strong>
                            </span>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-4 mt-6">
                        <Button
                            className="bg-green-600"
                            onClick={() => router.push(`/events/${event.id}/edit`)}
                        >
                            Edit 
                            <SquarePen className="h-4 w-4"/>
                        </Button>

                        <Button className="bg-red-600" onClick={handleDelete}>
                            Delete 
                            <Trash2 className="h-4 w-4"/>
                        </Button>

                        <Button asChild className="bg-blue-600">
                            <Link href={`/events/${id}/chat`} className="flex items-center gap-2">
                                Open Chat
                                <MessageSquare className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
