// src/components/dashboard/MiniCalendar.tsx
"use client";

import { useMemo, useState } from "react";
import { startOfMonth, endOfMonth, startOfWeek, addDays, format, isSameDay, parseISO } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Event = { id: number | string; date: string; title?: string };

export default function MiniCalendar({ events }: { events: Event[] }) {
    const [current, setCurrent] = useState(new Date());

    const monthStart = startOfMonth(current);
    const monthEnd = endOfMonth(current);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday

    // compute days array
    const days = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 42; i++) {
            arr.push(addDays(startDate, i));
        }
        return arr;
    }, [startDate]);

    const eventDates = useMemo(() => events.map((e) => parseISO(e.date)), [events]);

    return (
        <Card>
            <CardHeader className="flex items-center justify-between">
                <CardTitle>Calendar</CardTitle>
                <div className="flex gap-2">
                    <button onClick={() => setCurrent(addDays(monthStart, -1))} className="text-sm">Prev</button>
                    <button onClick={() => setCurrent(new Date())} className="text-sm">Today</button>
                    <button onClick={() => setCurrent(addDays(monthEnd, 1))} className="text-sm">Next</button>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-7 gap-1 text-xs text-center">
                    {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                        <div key={d} className="font-medium">{d}</div>
                    ))}
                    {days.map((day) => {
                        const isEvent = eventDates.some((ed) => isSameDay(ed, day));
                        const isCurrentMonth = day.getMonth() === current.getMonth();
                        return (
                            <div key={day.toString()} className={`p-2 rounded ${!isCurrentMonth ? "text-slate-400" : ""}`}>
                                <div className={`inline-block w-6 h-6 leading-6 rounded-full ${isEvent ? "bg-blue-600 text-white" : ""}`}>
                                    {format(day, "d")}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
