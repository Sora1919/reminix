// app/events/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import EventList from "@/components/events/EventList";
import EventFilters from "@/components/events/EventFilters";

interface Event {
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
}

interface Category {
    id: number;
    name: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch("/api/categories");
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        }
        fetchCategories();
    }, []);

    // Fetch events
    useEffect(() => {
        async function fetchEvents() {
            setLoading(true);
            try {
                const params = new URLSearchParams();

                // Only add filters if not "all"
                if (categoryFilter && categoryFilter !== "all") {
                    params.set("categoryId", categoryFilter);
                }
                if (priorityFilter && priorityFilter !== "all") {
                    params.set("priority", priorityFilter);
                }
                if (searchText) {
                    params.set("search", searchText);
                }

                // Always include relations
                params.set("include", "true");

                const res = await fetch(`/api/events?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data);
                    setFilteredEvents(data);
                }
            } catch (error) {
                console.error("Failed to fetch events:", error);
            } finally {
                setLoading(false);
            }
        }

        const debounceTimer = setTimeout(() => {
            fetchEvents();
        }, 300); // Debounce search

        return () => clearTimeout(debounceTimer);
    }, [categoryFilter, priorityFilter, searchText]);

    // Apply local filters (if you want additional client-side filtering)
    useEffect(() => {
        let result = [...events];

        if (searchText) {
            const query = searchText.toLowerCase();
            result = result.filter(event =>
                event.title.toLowerCase().includes(query) ||
                (event.description && event.description.toLowerCase().includes(query))
            );
        }

        setFilteredEvents(result);
    }, [events, searchText]);

    function clearFilters() {
        setCategoryFilter("all");
        setPriorityFilter("all");
        setSearchText("");
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Your Events
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage and organize all your upcoming events
                    </p>
                </div>
                <Link
                    href="/events/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    + Create New Event
                </Link>
            </div>

            {/* Filters Card */}
            <Card className="mb-8">
                <CardContent className="p-0">
                    <EventFilters
                        categories={categories}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        priorityFilter={priorityFilter}
                        setPriorityFilter={setPriorityFilter}
                        searchText={searchText}
                        setSearchText={setSearchText}
                        clearFilters={clearFilters}
                    />
                </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-600">
                    Showing <span className="font-semibold">{filteredEvents.length}</span> events
                </p>
                {loading && (
                    <p className="text-blue-600 animate-pulse">Loading events...</p>
                )}
            </div>

            {/* Events List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading events...</p>
                </div>
            ) : (
                <EventList events={filteredEvents} />
            )}

            {/* Empty State */}
            {!loading && filteredEvents.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500 text-lg">No events found</p>
                    <p className="text-gray-400 mt-2">
                        {events.length === 0
                            ? "Create your first event to get started!"
                            : "Try adjusting your filters"}
                    </p>
                    {events.length === 0 && (
                        <Link
                            href="/events/create"
                            className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                        >
                            Create Your First Event
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}