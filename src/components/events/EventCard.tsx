"use client";

import Link from "next/link";

interface EventCardProps {
    event: {
        id: number;
        title: string;
        description?: string;
        startDate: string;
        endDate: string;
        priority: "LOW" | "MEDIUM" | "HIGH";
        category?: {
            id: number;
            name: string;
        };
        location?: string;
    };
}

export default function EventCard({ event }: EventCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "HIGH":
                return "bg-red-100 text-red-600";
            case "MEDIUM":
                return "bg-yellow-100 text-yellow-700";
            case "LOW":
                return "bg-green-100 text-green-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <Link
            href={`/events/${event.id}`}
            className="block border p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white"
        >
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-gray-800 line-clamp-1">
                    {event.title}
                </h2>
                <span className={`px-2 py-1 text-xs rounded font-medium ${getPriorityColor(event.priority)}`}>
                    {event.priority}
                </span>
            </div>

            {event.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {event.description}
                </p>
            )}

            <div className="text-sm text-gray-500 space-y-1">
                <div className="flex items-center gap-1">
                    <span className="font-medium">Start:</span>
                    <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-medium">End:</span>
                    <span>{formatDate(event.endDate)}</span>
                </div>
            </div>

            {event.location && (
                <p className="text-sm text-gray-500 mt-3 flex items-center gap-1">
                    📍 {event.location}
                </p>
            )}

            {event.category && (
                <div className="mt-3">
                    <span className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        {event.category.name}
                    </span>
                </div>
            )}
        </Link>
    );
}