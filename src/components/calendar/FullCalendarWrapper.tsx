"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useSession } from "next-auth/react";

import EventModal from "./EventModal";
import { Button } from "@/components/ui/button";
import { Calendar, Grid3x3, List, ChevronLeft, ChevronRight } from "lucide-react";

type CalendarView = "dayGridMonth" | "timeGridWeek";

function pickTextColor(hex: string) {
    // hex: #RRGGBB or #RRGGBBAA
    const c = hex.replace("#", "");
    const clean = c.length >= 6 ? c.slice(0, 6) : "000000";
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.65 ? "#111827" : "#ffffff";
}

export default function FullCalendarWrapper() {
    const { data: session, status } = useSession();

    const calendarRef = useRef<any>(null);
    const loadingCountRef = useRef(0);

    const [view, setView] = useState<CalendarView>("dayGridMonth");
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const [categories, setCategories] = useState<Array<{ id: number; name: string; color?: string }>>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch("/api/categories");
                if (!res.ok) return;
                const data = await res.json();
                setCategories(data);
            } catch (error) {
                console.error("Failed to load categories:", error);
            }
        }
        loadCategories();
    }, []);

    const fetchEvents = useCallback(
        async (
            fetchInfo: { startStr: string; endStr: string },
            successCallback: (events: any[]) => void,
            failureCallback: (err?: any) => void
        ) => {
            if (status !== "authenticated") {
                failureCallback("Not authenticated");
                return;
            }

            loadingCountRef.current += 1;
            setLoading(true);

            try {
                const res = await fetch(
                    `/api/events?start=${encodeURIComponent(fetchInfo.startStr)}&end=${encodeURIComponent(fetchInfo.endStr)}`
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const events = await res.json();
                const currentUserId = parseInt(session?.user?.id || "0");

                const calendarEvents = events.map((event: any) => {
                    const isCreator = event.creatorId === currentUserId;
                    const baseColor = event.category?.color || "#4CAF50";

                    const bg = isCreator ? baseColor : `${baseColor}80`; // alpha for collaborator
                    const textColor = pickTextColor(baseColor);

                    return {
                        id: String(event.id),
                        title: event.title,
                        start: event.startDate,
                        end: event.endDate,
                        backgroundColor: bg,
                        borderColor: baseColor,
                        textColor,
                        classNames: [isCreator ? "reminix-my-event" : "reminix-collab-event"],
                        extendedProps: { raw: event },
                    };
                });

                successCallback(calendarEvents);
            } catch (err) {
                console.error("Calendar fetch error:", err);
                failureCallback(err);
            } finally {
                loadingCountRef.current -= 1;
                if (loadingCountRef.current <= 0) setLoading(false);
            }
        },
        [status, session?.user?.id]
    );

    function handleEventClick(clickInfo: any) {
        const raw = clickInfo.event.extendedProps.raw;
        setSelectedEvent(raw);
        setModalOpen(true);
    }

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-80">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="reminix-calendar relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Calendar View</h2>
                        <p className="text-sm text-muted-foreground">Interactive event calendar</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <div className="flex border border-border rounded-xl overflow-hidden">
                        <Button
                            variant={view === "dayGridMonth" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => {
                                setView("dayGridMonth");
                                calendarRef.current?.getApi()?.changeView("dayGridMonth");
                            }}
                            className="rounded-none border-r border-border"
                        >
                            <Grid3x3 className="h-4 w-4 mr-2" />
                            Month
                        </Button>

                        <Button
                            variant={view === "timeGridWeek" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => {
                                setView("timeGridWeek");
                                calendarRef.current?.getApi()?.changeView("timeGridWeek");
                            }}
                            className="rounded-none"
                        >
                            <List className="h-4 w-4 mr-2" />
                            Week
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => calendarRef.current?.getApi()?.prev()}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => calendarRef.current?.getApi()?.today()}>
                            Today
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => calendarRef.current?.getApi()?.next()}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 bg-background/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                        <p className="text-sm text-muted-foreground mt-2">Loading events...</p>
                    </div>
                </div>
            )}

            {/* Calendar (important: no bg-white) */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={view}
                    headerToolbar={false}
                    events={fetchEvents}
                    eventClick={handleEventClick}
                    height="auto"
                    nowIndicator={true}
                    dayMaxEvents={2}
                    initialDate={new Date()}
                    validRange={{
                        start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
                        end: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
                    }}
                />
            </div>

            {/* Legend */}
            <div className="mt-4 p-4 rounded-xl border border-border bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground mb-3">Color Legend</h3>

                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-muted-foreground">Your events</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary/40" />
                        <span className="text-muted-foreground">Collaborator events</span>
                    </div>

                    {categories.slice(0, 5).map((cat) => (
                        <div key={cat.id} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || "#4CAF50" }} />
                            <span className="text-muted-foreground">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <EventModal open={modalOpen} onOpenChange={setModalOpen} event={selectedEvent} />
        </div>
    );
}