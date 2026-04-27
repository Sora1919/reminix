"use client";

import EventCard, { type EventItem } from "./EventCard";

interface EventListProps {
    events: EventItem[];
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