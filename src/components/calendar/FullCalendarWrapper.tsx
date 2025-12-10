"use client";

import FullCalendar, { EventInput, DateSelectArg, EventApi } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRef, useState } from "react";
import EventModal from "./EventModal";
import { Button } from "@/components/ui/button";
import { formatISO } from "date-fns";

export default function FullCalendarWrapper() {
    const calendarRef = useRef<any | null>(null);
    const [view, setView] = useState<"dayGridMonth" | "timeGridWeek">("dayGridMonth");
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // event source function: FullCalendar will call this with start/end
    async function fetchEvents(fetchInfo: { startStr: string; endStr: string }, successCallback: (events: EventInput[]) => void, failureCallback: (err?: any) => void) {
        try {
            const res = await fetch(`/api/events?start=${encodeURIComponent(fetchInfo.startStr)}&end=${encodeURIComponent(fetchInfo.endStr)}`);
            if (!res.ok) throw new Error("Failed to load events");
            const data = await res.json();

            // map prisma event -> fullcalendar EventInput
            const events: EventInput[] = data.map((e: any) => ({
                id: String(e.id),
                title: e.title,
                start: e.startDate,
                end: e.endDate,
                backgroundColor: e.category?.color ?? "#4CAF50",
                borderColor: e.category?.color ?? "#4CAF50",
                extendedProps: {
                    raw: e,
                },
            }));

            successCallback(events);
        } catch (err) {
            console.error(err);
            failureCallback(err);
        }
    }

    function handleEventClick(clickInfo: any) {
        const raw = clickInfo.event.extendedProps.raw;
        setSelectedEvent(raw);
        setModalOpen(true);
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                    <Button onClick={() => { setView("dayGridMonth"); const cal = calendarRef.current?.getApi(); cal?.changeView("dayGridMonth"); }}>Month</Button>
                    <Button onClick={() => { setView("timeGridWeek"); const cal = calendarRef.current?.getApi(); cal?.changeView("timeGridWeek"); }}>Week</Button>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => { const cal = calendarRef.current?.getApi(); cal?.today(); }}>Today</Button>
                </div>
            </div>

            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={view}
                headerToolbar={false}
                events={fetchEvents}
                eventClick={handleEventClick}
                height="auto"
                weekNumbers={false}
                nowIndicator
                slotMinTime="06:00:00"
                slotMaxTime="23:00:00"
            />

            <EventModal open={modalOpen} onOpenChange={setModalOpen} event={selectedEvent} />
        </div>
    );
}
