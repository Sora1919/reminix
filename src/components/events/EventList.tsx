"use client";

import EventCard from "./EventCard";

interface Event {
    id: number;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    category?: { id: number; name: string };
    location?: string;
}

interface EventListProps {
    events: Event[];
}

export default function EventList({ events }: EventListProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {events.map((event) => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
    );
}