import EventForm from "@/components/events/EventForm";
import prisma from "@/lib/prisma";

export default async function EventCreatePage() {
    const categories = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
        },
        orderBy: { name: "asc" },
    });

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Create Event</h1>
            <EventForm mode="create" categories={categories} />
        </div>
    );
}
