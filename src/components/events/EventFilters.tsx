"use client";

import { useMemo, useState } from "react";
import { Search, Filter, FilterX } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";

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
                                         clearFilters,
                                     }: EventFiltersProps) {
    const [open, setOpen] = useState(false);

    const activeCount = useMemo(() => {
        let c = 0;
        if (categoryFilter !== "all") c += 1;
        if (priorityFilter !== "all") c += 1;
        return c;
    }, [categoryFilter, priorityFilter]);

    return (
        <div className="p-4 flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search events by title or description"
                    className="pl-9"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            {/* Desktop filters */}
            <div className="hidden md:flex items-center gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[200px]">
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

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters} className="gap-2">
                    <FilterX className="h-4 w-4" />
                    Clear
                </Button>
            </div>

            {/* Mobile controls */}
            <div className="flex md:hidden items-center gap-2">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="flex-1 gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                            {activeCount > 0 ? (
                                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">
                  {activeCount}
                </span>
                            ) : null}
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="right" className="p-0">
                        <SheetHeader>
                            <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>

                        <div className="px-4 pb-4 space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Category</p>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-full">
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
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Priority</p>
                                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="All Priorities" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Priorities</SelectItem>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <SheetFooter>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 gap-2"
                                    onClick={() => {
                                        clearFilters();
                                        setOpen(false);
                                    }}
                                >
                                    <FilterX className="h-4 w-4" />
                                    Clear
                                </Button>

                                <SheetClose asChild>
                                    <Button className="flex-1">Done</Button>
                                </SheetClose>
                            </div>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={clearFilters}
                    aria-label="Clear filters"
                >
                    <FilterX className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}