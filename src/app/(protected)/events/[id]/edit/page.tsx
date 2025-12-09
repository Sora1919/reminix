"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import EventForm from "@/components/events/EventForm";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [eventData, setEventData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvent() {
            try {
                const res = await fetch(`/api/events/${id}`);

                if (!res.ok) {
                    toast("Failed to load event.");
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setEventData(data);
            } catch (error) {
                toast("Error loading event.");
            } finally {
                setLoading(false);
            }
        }

        fetchEvent();
    }, [id]);

    async function handleUpdate(values: any) {
        try {
            const res = await fetch(`/api/events/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                toast("Failed to update event.");
                return;
            }

            toast("Event updated successfully!");
            router.push(`/events/${id}`);
        } catch (error) {
            toast("Error updating event.");
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            </div>
        );
    }

    if (!eventData) {
        return (
            <div className="text-center p-10">
                <p className="text-gray-600">Event not found.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Edit Event</h1>

            <EventForm
                mode="edit"  // Add this!
                id={id}      // Add this!
                initialData={eventData}
                onSuccess={(updatedEvent) => {
                    toast("Event updated successfully!");
                    router.push(`/events/${updatedEvent.id}`);
                }}
            />
        </div>
    );
}
