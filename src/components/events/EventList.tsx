// components/events/EventList.tsx
"use client";

import EventCard from "./EventCard";

interface Event {
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
    // Add other properties as needed
}

interface EventListProps {
    events: Event[];
}

export default function EventList({ events }: EventListProps) {
    if (!events.length) {
        return <p className="text-gray-500 text-center py-8">No events found. Create one!</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
    );
}