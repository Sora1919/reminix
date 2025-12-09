"use client";

import { useEffect, useState } from "react";
import { addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { CalendarIcon, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Mode = "create" | "edit";

export default function EventForm({
                                      mode,
                                      id,
                                      initialData,
                                      categories,
                                      onSuccess,
                                  }: {
    mode: Mode;
    id?: string; // event id when editing (optional if initialData provided)
    initialData?: any; // optional pre-fetched event object
    categories?: { id: number; name: string }[]; // optional categories list
    onSuccess?: (event: any) => void;
}) {
    const router = useRouter();
    const { data: session, status } = useSession();

    // UI states
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 1));
    const [startTime, setStartTime] = useState("12:00");
    const [endTime, setEndTime] = useState("12:00");

    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

    const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
    const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY">("DAILY");
    const [interval, setInterval] = useState<number>(1);
    const [notifyBefore, setNotifyBefore] = useState<number>(30);

    // controlled inputs
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");

    // loading / submitting
    const [loading, setLoading] = useState(mode === "edit" && !!id && !initialData);
    const [submitting, setSubmitting] = useState(false);

    // default categories (if none provided)
    const defaultCategories = [
        { id: 1, name: "Work" },
        { id: 2, name: "Personal" },
        { id: 3, name: "Health" },
    ];

    const categoryList = categories ?? defaultCategories;

    // combine date & time helper
    function combineDateTime(date: Date | undefined, time: string) {
        if (!date || !time) return null;
        const [hours, minutes] = time.split(":").map(Number);
        const combined = new Date(date);
        combined.setHours(hours);
        combined.setMinutes(minutes);
        combined.setSeconds(0);
        combined.setMilliseconds(0);
        return combined;
    }

    // Load event data when editing (if initialData not provided)
    useEffect(() => {
        let mounted = true;
        async function load() {
            if (mode !== "edit") return setLoading(false);
            if (!id && !initialData) {
                toast("No event id provided for edit");
                setLoading(false);
                return;
            }
            if (initialData) {
                // populate from initialData
                const e = initialData;
                if (!mounted) return;
                setTitle(e.title ?? "");
                setDescription(e.description ?? "");
                setLocation(e.location ?? "");
                setStartDate(e.startDate ? new Date(e.startDate) : new Date());
                setEndDate(e.endDate ? new Date(e.endDate) : addDays(new Date(), 1));

                // set times from startDate/endDate if available
                if (e.startDate) {
                    const s = new Date(e.startDate);
                    setStartTime(s.toTimeString().slice(0, 5));
                }
                if (e.endDate) {
                    const en = new Date(e.endDate);
                    setEndTime(en.toTimeString().slice(0, 5));
                }

                setCategoryId(e.categoryId ?? null);
                setPriority((e.priority ?? "MEDIUM") as "LOW" | "MEDIUM" | "HIGH");
                setNotifyBefore(e.notifyBefore ?? 30);

                if (e.recurrence) {
                    setRecurrenceEnabled(true);
                    setFrequency(e.recurrence.frequency ?? "DAILY");
                    setInterval(e.recurrence.interval ?? 1);
                } else {
                    setRecurrenceEnabled(false);
                }

                setLoading(false);
                return;
            }

            // fetch from API if no initialData
            try {
                setLoading(true);
                const res = await fetch(`/api/events/${id}`);
                if (!res.ok) {
                    toast("Failed to load event");
                    setLoading(false);
                    return;
                }
                const e = await res.json();
                if (!mounted) return;
                setTitle(e.title ?? "");
                setDescription(e.description ?? "");
                setLocation(e.location ?? "");
                setStartDate(e.startDate ? new Date(e.startDate) : new Date());
                setEndDate(e.endDate ? new Date(e.endDate) : addDays(new Date(), 1));
                if (e.startDate) {
                    const s = new Date(e.startDate);
                    setStartTime(s.toTimeString().slice(0, 5));
                }
                if (e.endDate) {
                    const en = new Date(e.endDate);
                    setEndTime(en.toTimeString().slice(0, 5));
                }
                setCategoryId(e.categoryId ?? null);
                setPriority((e.priority ?? "MEDIUM") as "LOW" | "MEDIUM" | "HIGH");
                setNotifyBefore(e.notifyBefore ?? 30);

                if (e.recurrence) {
                    setRecurrenceEnabled(true);
                    setFrequency(e.recurrence.frequency ?? "DAILY");
                    setInterval(e.recurrence.interval ?? 1);
                } else {
                    setRecurrenceEnabled(false);
                }
            } catch (err) {
                console.error(err);
                toast("Failed to load event");
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => {
            mounted = false;
        };
    }, [mode, id, initialData]);

    // prevent unauthenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    async function handleSubmit(e: any) {
        e.preventDefault();

        if (!title) {
            toast("Title is required");
            return;
        }

        const finalStart = combineDateTime(startDate, startTime);
        const finalEnd = combineDateTime(endDate, endTime);

        if (!finalStart || !finalEnd) {
            toast("Start and end date/time are required");
            return;
        }

        setSubmitting(true);

        const payload: any = {
            title,
            description,
            location,
            startDate: finalStart,
            endDate: finalEnd,
            priority,
            categoryId,
            notifyBefore,
            recurrence: recurrenceEnabled
                ? {
                    frequency,
                    interval,
                    byWeekdays: null,
                    count: null,
                    until: null,
                }
                : null,
        };

        // creatorId: for create, use current session; for edit, keep original if present
        if (mode === "create") {
            payload.creatorId = Number(session?.user?.id);
        } else if (initialData?.creatorId) {
            payload.creatorId = initialData.creatorId;
        }

        try {
            const endpoint = mode === "create" ? "/api/events" : `/api/events/${id ?? initialData?.id}`;
            const method = mode === "create" ? "POST" : "PUT";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => "");
                console.error("Save event error:", errText);
                toast("Failed to save event");
                setSubmitting(false);
                return;
            }

            const saved = await res.json();
            toast(mode === "create" ? "Event created successfully." : "Event updated successfully.");

            if (onSuccess) onSuccess(saved);
            // redirect to detail page
            router.push(`/events/${saved.id}`);
        } catch (err) {
            console.error(err);
            toast("An error occurred");
        } finally {
            setSubmitting(false);
        }
    }

    // button label
    const submitLabel = mode === "create" ? "Create Event" : "Update Event";

    if (loading) {
        return (
            <div className="flex justify-center p-10">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="flex gap-6 p-6">
            {/* LEFT COLUMN — MAIN EVENT INFO */}
            <div className="w-2/3 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{mode === "create" ? "Create New Event" : "Edit Event"}</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <Label>Title</Label>
                                <Input
                                    name="title"
                                    required
                                    placeholder="Event title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    name="description"
                                    placeholder="Event description..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <Label>Location</Label>
                                <Input
                                    name="location"
                                    placeholder="Optional location..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            {/* Date Pickers */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Start Date */}
                                <div>
                                    <Label>Start Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate?.toDateString()}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* End Date */}
                                <div>
                                    <Label>End Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate?.toDateString()}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* TIME PICKERS */}
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <Label>Start Time</Label>
                                        <Input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label>End Time</Label>
                                        <Input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? <span className="opacity-80">Saving...</span> : submitLabel}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* RIGHT COLUMN — SETTINGS */}
            <div className="w-1/3 space-y-6">
                {/* CATEGORY + PRIORITY */}
                <Card>
                    <CardHeader>
                        <CardTitle>Event Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Category */}
                        <div>
                            <Label>Category</Label>
                            <Select value={categoryId ? String(categoryId) : ""} onValueChange={(v) => setCategoryId(Number(v))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryList.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority */}
                        <div>
                            <Label>Priority</Label>
                            <RadioGroup value={priority} onValueChange={(v) => setPriority(v as any)}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="LOW" id="low" />
                                    <Label htmlFor="low">Low</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="MEDIUM" id="medium" />
                                    <Label htmlFor="medium">Medium</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="HIGH" id="high" />
                                    <Label htmlFor="high">High</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </CardContent>
                </Card>

                {/* NOTIFICATIONS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Label>Notify Before (minutes)</Label>
                        <Input
                            type="number"
                            value={notifyBefore}
                            onChange={(e) => setNotifyBefore(Number(e.target.value))}
                            min={0}
                        />
                    </CardContent>
                </Card>

                {/* RECURRENCE */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recurrence</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Toggle */}
                        <div className="flex items-center justify-between">
                            <Label>Enable recurrence</Label>
                            <Switch checked={recurrenceEnabled} onCheckedChange={setRecurrenceEnabled} />
                        </div>

                        {recurrenceEnabled && (
                            <div className="space-y-4">
                                {/* Frequency */}
                                <div>
                                    <Label>Frequency</Label>
                                    <Select value={frequency} onValueChange={(v) => setFrequency(v as any)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DAILY">Daily</SelectItem>
                                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="YEARLY">Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Interval */}
                                <div>
                                    <Label>Repeat every</Label>
                                    <Input
                                        type="number"
                                        value={interval}
                                        onChange={(e) => setInterval(Number(e.target.value))}
                                        min={1}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
