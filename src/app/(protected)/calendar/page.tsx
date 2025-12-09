"use client";

import { useEffect, useState } from "react";
import Calendar from "@/components/calendar/Calendar";
import CalendarHeader from "@/components/calendar/CalendarHeader";

export default function CalendarPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        async function loadEvents() {
            try {
                const month = currentDate.getMonth() + 1;
                const year = currentDate.getFullYear();

                const res = await fetch(`/api/events?month=${month}&year=${year}`);
                const data = await res.json();

                setEvents(data);
            } catch (e) {
                console.error("Error loading events", e);
            }
            setLoading(false);
        }
        loadEvents();
    }, [currentDate]);

    if (loading)
        return <p className="text-center py-10">Loading calendar...</p>;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <CalendarHeader
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
            />
            <Calendar
                currentDate={currentDate}
                events={events}
            />
        </div>
    );
}
