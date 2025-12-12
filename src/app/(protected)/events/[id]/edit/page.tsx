"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import EventForm from "@/components/events/EventForm";
import EventCollaborators from "@/components/events/EventCollaborators";

export default function EditEventPage({
                                          params: routeParams
                                      }: {
    params: { id: string }
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const urlParams = useParams(); // Renamed to avoid conflict
    const id = urlParams.id as string || routeParams.id; // Use both for safety

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        async function fetchEvent() {
            try {
                const res = await fetch(`/api/events/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setEvent(data);
                } else {
                    toast.error("Failed to load event");
                }
            } catch (error) {
                console.error("Failed to fetch event:", error);
                toast.error("Failed to load event");
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchEvent();
        }
    }, [id]);

    async function handleUpdate(values: any) {
        setUpdating(true);
        try {
            const res = await fetch(`/api/events/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const error = await res.json();
                toast.error(error.error || "Failed to update event");
                return;
            }

            const updatedEvent = await res.json();
            toast.success("Event updated successfully!");
            router.push(`/events/${updatedEvent.id}`);
            router.refresh(); // Refresh the page data
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Error updating event");
        } finally {
            setUpdating(false);
        }
    }

    // Loading states
    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    // Authentication check
    if (!session) {
        router.push("/login");
        return null;
    }

    // Event not found
    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
                <p className="text-gray-600 mb-6">The event you&#39;re looking for doesn&#39;t exist.</p>
                <button
                    onClick={() => router.push("/events")}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Back to Events
                </button>
            </div>
        );
    }

    const currentUserId = parseInt(session.user.id);
    const isCreator = event.creatorId === currentUserId;

    // If not creator, show unauthorized message
    if (!isCreator) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-6">
                    You don&#39;t have permission to edit this event.
                </p>
                <button
                    onClick={() => router.push(`/events/${id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    View Event
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Event</h1>
                <p className="text-gray-600">
                    Update your event details and manage collaborators
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Event Form - Takes 2/3 width on large screens */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <EventForm
                            mode="edit"
                            id={id}
                            initialData={event}
                            onSuccess={(updatedEvent) => {
                                toast.success("Event updated successfully!");
                                setEvent(updatedEvent); // Update local state
                                router.push(`/events/${updatedEvent.id}`);
                            }}
                        />
                    </div>
                </div>

                {/* Collaborators Section - Takes 1/3 width on large screens */}
                <div className="lg:col-span-1">
                    <EventCollaborators
                        eventId={parseInt(id)}
                        currentUserId={currentUserId}
                        isCreator={isCreator}
                    />
                </div>
            </div>

            {/* Update Button (alternative to form's submit) */}
            {updating && (
                <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                    Updating event...
                </div>
            )}
        </div>
    );
}