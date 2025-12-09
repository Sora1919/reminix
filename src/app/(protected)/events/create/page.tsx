import EventForm from "@/components/events/EventForm";

export default function EventCreatePage() {
    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Create Event</h1>
            <EventForm mode="create" />
        </div>
    );
}
