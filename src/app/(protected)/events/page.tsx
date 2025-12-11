"use client";

import Link from "next/link";
import EventList from "@/components/events/EventList";
import {useEffect, useState} from "react";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import { Search, FilterX } from "lucide-react";

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        async function fetchCategories() {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(data);
        }
        fetchCategories();
    }, []);

    useEffect(() => {
        async function fetchEvents() {
            const params = new URLSearchParams();

            if (categoryFilter) params.set("categoryId", categoryFilter);
            if (priorityFilter) params.set("priority", priorityFilter);
            if (searchText) params.set("search", searchText);

            const res = await fetch(`/api/events?${params.toString()}`);
            const data = await res.json();
            setEvents(data);
        }
        fetchEvents();
    }, [categoryFilter, priorityFilter, searchText]);

    function clearFilters() {
        setCategoryFilter("");
        setPriorityFilter("");
        setSearchText("");
    }


    return (
        <div className="p-8">

            {/* Filters */}
            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">

                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Search events by title or description"
                                className="pl-10"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <Select
                        value={categoryFilter}
                        onValueChange={(value) => setCategoryFilter(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={String(cat.id)}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Priority Filter */}
                    <Select
                        value={priorityFilter}
                        onValueChange={(value) => setPriorityFilter(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Clear Button */}
                    <Button variant="outline" onClick={clearFilters}>
                        <FilterX className="h-4 w-4 mr-2" />
                        Clear
                    </Button>

                </CardContent>
            </Card>



            <div className="flex items-center justify-between my-6">
                <h1 className="text-3xl font-bold">Your Events</h1>
                <Link
                    href="/events/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    + Create Event
                </Link>
            </div>

            <EventList events={events} />
        </div>
    );
}
