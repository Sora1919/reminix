"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";


export default function Calendar({ currentDate, events }: any) {
    const router = useRouter();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Start weekday (0 = Sunday)
    const startDay = firstDay.getDay();

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    function getEventsForDay(day: number) {
        return events.filter(e =>
            new Date(e.startDate).getDate() === day &&
            new Date(e.startDate).getMonth() === month
        );
    }

    return (
        <div className="grid grid-cols-7 gap-3 border p-4 rounded-lg bg-white shadow">
            {/* Weekday labels */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-center font-semibold text-gray-600">
                    {d}
                </div>
            ))}

            {/* Empty cells before the 1st */}
            {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} />
            ))}

            {/* Calendar days */}
            {daysArray.map(day => {
                const dayEvents = getEventsForDay(day);

                return (
                    <div
                        key={day}
                        className={cn(
                            "min-h-24 p-2 border rounded-md cursor-pointer hover:bg-gray-100",
                            dayEvents.length > 0 && "bg-green-50 border-green-500"
                        )}
                        onClick={() => {
                            if (dayEvents.length > 0) {
                                router.push(`/events/${dayEvents[0].id}`);
                            }
                        }}
                    >
                        <div className="font-bold">{day}</div>

                        {/* Show up to 2 events */}
                        <div className="space-y-1 mt-2">
                            {dayEvents.slice(0, 2).map(evt => (
                                <div
                                    key={evt.id}
                                    className="text-xs p-1 rounded bg-green-600 text-white truncate"
                                >
                                    {evt.title}
                                </div>
                            ))}

                            {/* Show + more */}
                            {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-500">
                                    +{dayEvents.length - 2} more
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
