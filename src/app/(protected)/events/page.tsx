"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import EventList from "@/components/events/EventList";
import EventFilters from "@/components/events/EventFilters";

interface Event {
    id: number;
    title: string;
    description?: string | null;
    startDate: string;
    endDate: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    location?: string | null;
    category?: { id: number; name: string } | null;
}

interface Category {
    id: number;
    name: string;
}

function EventsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="py-4">
                    <CardContent className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <Skeleton className="h-5 w-14 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex justify-between pt-1">
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-4 w-10" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);

    // ✅ Fetch categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch("/api/categories");
                if (res.ok) setCategories(await res.json());
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        }
        fetchCategories();
    }, []);

    // ✅ Fetch events only when CATEGORY or PRIORITY changes
    useEffect(() => {
        async function fetchEvents() {
            setLoading(true);
            try {
                const params = new URLSearchParams();

                if (categoryFilter !== "all") params.set("categoryId", categoryFilter);
                if (priorityFilter !== "all") params.set("priority", priorityFilter);

                params.set("include", "true");

                const res = await fetch(`/api/events?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data);
                }
            } catch (error) {
                console.error("Failed to fetch events:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, [categoryFilter, priorityFilter]);

    // ✅ Client-side search filter (always works)
    const filteredEvents = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        if (!q) return events;

        return events.filter((e) => {
            const title = (e.title || "").toLowerCase();
            const desc = (e.description || "").toLowerCase();
            return title.includes(q) || desc.includes(q);
        });
    }, [events, searchText]);

    function clearFilters() {
        setCategoryFilter("all");
        setPriorityFilter("all");
        setSearchText("");
    }

    return (
        <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your Events</h1>
                    <p className="mt-1 text-muted-foreground">
                        Manage and organize all your upcoming events
                    </p>
                </div>

                <Button asChild className="gap-2 self-start md:self-auto">
                    <Link href="/events/create">
                        <Plus className="h-4 w-4" />
                        Create Event
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <Card className="mt-6 py-0">
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

            {/* Summary */}
            <div className="mt-6 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{filteredEvents.length}</span> events
                </p>
            </div>

            {/* List / Empty */}
            <div className="mt-4">
                {loading ? (
                    <EventsSkeleton />
                ) : filteredEvents.length > 0 ? (
                    <EventList events={filteredEvents} />
                ) : (
                    <div className="mt-6 rounded-xl border border-dashed p-10 text-center">
                        <p className="text-lg font-semibold">No events found</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {events.length === 0 ? "Create your first event to get started." : "Try a different search."}
                        </p>
                        {events.length === 0 ? (
                            <Button asChild className="mt-4">
                                <Link href="/events/create">Create Your First Event</Link>
                            </Button>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}