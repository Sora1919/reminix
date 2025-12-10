import FullCalendarWrapper from "@/components/calendar/FullCalendarWrapper";

export default function CalendarPage() {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Calendar</h1>
            <FullCalendarWrapper />
        </div>
    );
}
