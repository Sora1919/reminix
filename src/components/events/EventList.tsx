"use client";

import { useEffect, useState } from "react";
import EventCard from "./EventCard";

export default function EventList() {
    const [events, setEvents] = useState([]);


    useEffect(() => {
        fetch("/api/events")
            .then(res => res.json())
            .then(setEvents);
    }, []);

    if (!events.length) {
        return <p className="text-gray-500">No events yet. Create one!</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map(event => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
    );
}
