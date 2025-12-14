// app/calendar/page.tsx
import FullCalendarWrapper from "@/components/calendar/FullCalendarWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Calendar</h1>
                    <p className="text-gray-600 mt-1">
                        View and manage all your events in calendar format
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        asChild
                    >
                        <Link href="/events">
                            List View
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/events/create" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            New Event
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-lg border p-4 md:p-6">
                <FullCalendarWrapper />
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-2">💡 Calendar Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Click on events to view details</li>
                    <li>• Switch between Month and Week views</li>
                    <li>• Use navigation buttons or drag to move through dates</li>
                    <li>• Events are color-coded by category and your role</li>
                </ul>
            </div>
        </div>
    );
}