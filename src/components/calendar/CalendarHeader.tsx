"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export default function CalendarHeader({ currentDate, setCurrentDate }: any) {
    function prevMonth() {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }

    function nextMonth() {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }

    function goToday() {
        setCurrentDate(new Date());
    }

    const monthName = currentDate.toLocaleString("default", { month: "long" });

    return (
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <CalendarIcon /> {monthName} {currentDate.getFullYear()}
            </h2>

            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={prevMonth}>
                    <ChevronLeft />
                </Button>
                <Button variant="outline" onClick={nextMonth}>
                    <ChevronRight />
                </Button>
                <Button onClick={goToday}>Today</Button>
            </div>
        </div>
    );
}
