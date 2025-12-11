"use client";

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

interface EventFiltersProps {
    categories: Array<{ id: number; name: string }>;
    categoryFilter: string;
    setCategoryFilter: (value: string) => void;
    priorityFilter: string;
    setPriorityFilter: (value: string) => void;
    searchText: string;
    setSearchText: (value: string) => void;
    clearFilters: () => void;
}

export default function EventFilters({
                                         categories,
                                         categoryFilter,
                                         setCategoryFilter,
                                         priorityFilter,
                                         setPriorityFilter,
                                         searchText,
                                         setSearchText,
                                         clearFilters
                                     }: EventFiltersProps) {
    return (
        <div className="p-4 flex flex-col md:flex-row gap-4">
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
                onValueChange={setCategoryFilter}
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
                onValueChange={setPriorityFilter}
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
        </div>
    );
}