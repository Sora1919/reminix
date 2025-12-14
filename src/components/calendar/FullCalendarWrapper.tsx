// components/calendar/FullCalendarWrapper.tsx
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import EventModal from "./EventModal";
import { Calendar, Grid3x3, List, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";

export default function FullCalendarWrapper() {
    const { data: session, status } = useSession();
    const calendarRef = useRef<any>(null);
    const [view, setView] = useState<"dayGridMonth" | "timeGridWeek">("dayGridMonth");
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [categories, setCategories] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(false);

    // Fetch categories for colors
    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch("/api/categories");
                if (res.ok) {
                    const data = await res.json();
                    const categoryMap: Record<number, string> = {};
                    data.forEach((cat: any) => {
                        categoryMap[cat.id] = cat.color || "#4CAF50";
                    });
                    setCategories(categoryMap);
                }
            } catch (error) {
                console.error("Failed to load categories:", error);
            }
        }
        loadCategories();
    }, []);

    // Event fetch function
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

            try {
                const res = await fetch(
                    `/api/events?start=${encodeURIComponent(fetchInfo.startStr)}&end=${encodeURIComponent(fetchInfo.endStr)}`
                );

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const events = await res.json();

                const currentUserId = parseInt(session?.user?.id || "0");

                const calendarEvents = events.map((event: any) => {
                    const isCreator = event.creatorId === currentUserId;
                    const categoryColor = event.category?.color || "#4CAF50";

                    return {
                        id: String(event.id),
                        title: event.title,
                        start: event.startDate,
                        end: event.endDate,
                        backgroundColor: isCreator ? categoryColor : `${categoryColor}80`,
                        borderColor: categoryColor,
                        textColor: "#000",
                        extendedProps: { raw: event },
                    };
                });

                successCallback(calendarEvents);
            } catch (err) {
                console.error("Calendar fetch error:", err);
                failureCallback(err);
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
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Calendar View</h2>
                        <p className="text-sm text-gray-500">Interactive event calendar</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <div className="flex border rounded-lg overflow-hidden">
                        <Button
                            variant={view === "dayGridMonth" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => {
                                setView("dayGridMonth");
                                calendarRef.current?.getApi()?.changeView("dayGridMonth");
                            }}
                            className="rounded-none border-r"
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
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => calendarRef.current?.getApi()?.prev()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => calendarRef.current?.getApi()?.today()}
                        >
                            Today
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => calendarRef.current?.getApi()?.next()}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Loading events...</p>
                    </div>
                </div>
            )}

            {/* Calendar */}
            <div className="border rounded-lg overflow-hidden bg-white">
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
                        start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
                        end: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 months future
                    }}
                />
            </div>

            {/* Legend */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Color Legend</h3>
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-gray-600">Your Events</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-200"></div>
                        <span className="text-xs text-gray-600">Collaborator Events</span>
                    </div>
                    {Object.entries(categories).slice(0, 3).map(([id, color]) => (
                        <div key={id} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                            <span className="text-xs text-gray-600">Category {id}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Event Modal */}
            <EventModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                event={selectedEvent}
            />
        </div>
    );
}