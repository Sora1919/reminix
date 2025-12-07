import Link from "next/link";
import EventList from "@/components/events/EventList";

export default function EventsPage() {
    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Your Events</h1>
                <Link
                    href="/events/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    + Create Event
                </Link>
            </div>

            <EventList />
        </div>
    );
}
