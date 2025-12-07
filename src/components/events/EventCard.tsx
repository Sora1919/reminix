"use client";

import Link from "next/link";

export default function EventCard({ event }) {
    return (
        <Link
            href={`/events/${event.id}`}
            className="border p-4 rounded-lg shadow hover:shadow-md transition"
        >
            <h2 className="text-xl font-semibold">{event.title}</h2>
            <p className="text-gray-600">{event.description}</p>

            <p className="text-sm mt-2">
                {new Date(event.startDate).toLocaleString()} →{" "}
                {new Date(event.endDate).toLocaleString()}
            </p>

            <span
                className={`mt-2 inline-block px-2 py-1 text-xs rounded ${
                    event.priority === "HIGH"
                        ? "bg-red-100 text-red-600"
                        : event.priority === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                }`}
            >
        {event.priority}
      </span>
        </Link>
    );
}
