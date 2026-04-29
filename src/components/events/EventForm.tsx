"use client";

import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";

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
import EventPreviewCard from "@/components/events/EventPreviewCard";

type Mode = "create" | "edit";

export default function EventForm({
                                      mode,
                                      id,
                                      initialData,
                                      categories,
                                      onSuccess,
                                  }: {
    mode: Mode;
    id?: string;
    initialData?: any;
    categories?: { id: number; name: string }[];
    onSuccess?: (event: any) => void;
}) {
    const router = useRouter();
    const { status } = useSession();

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
    const [collaboratorEmails, setCollaboratorEmails] = useState("");

    // controlled inputs (✅ required now)
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

    const [categoryList, setCategoryList] = useState(categories ?? defaultCategories);

    useEffect(() => {
        if (categories && categories.length > 0) {
            setCategoryList(categories);
            return;
        }

        let mounted = true;

        async function loadCategories() {
            try {
                const res = await fetch("/api/categories");
                if (!res.ok) return;

                const data = (await res.json()) as { id: number; name: string }[];
                if (mounted && data.length > 0) {
                    setCategoryList(data);
                }
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        }

        loadCategories();
        return () => {
            mounted = false;
        };
    }, [categories]);

    // ✅ For CREATE: auto-select first category (since category is required)
    useEffect(() => {
        if (mode !== "create") return;
        if (categoryId !== null) return;
        if (!categoryList || categoryList.length === 0) return;
        setCategoryId(categoryList[0].id);
    }, [mode, categoryId, categoryList]);

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

    function formatDateLabel(d?: Date) {
        if (!d) return "Pick a date";
        try {
            return format(d, "EEE, MMM d yyyy");
        } catch {
            return d.toDateString();
        }
    }

    // Load event data when editing
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
                const e = initialData;
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

                setLoading(false);
                return;
            }

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

        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();
        const trimmedLocation = location.trim();

        // ✅ Required fields (everything except recurrence)
        if (!trimmedTitle) return toast("Title is required");
        if (trimmedTitle.length < 3) return toast("Title must be at least 3 characters");

        if (!trimmedDescription) return toast("Description is required");
        if (trimmedDescription.length < 5) return toast("Description must be at least 5 characters");

        if (!trimmedLocation) return toast("Location is required");

        if (categoryId === null) return toast("Category is required");

        const finalStart = combineDateTime(startDate, startTime);
        const finalEnd = combineDateTime(endDate, endTime);

        if (!finalStart || !finalEnd) return toast("Start and end date/time are required");
        if (finalStart >= finalEnd) return toast("End date/time must be after start date/time");

        if (!Number.isFinite(notifyBefore)) return toast("Notify before is required");
        if (notifyBefore < 0 || notifyBefore > 10080) {
            return toast("Notify before must be between 0 and 10080 minutes (7 days)");
        }

        if (recurrenceEnabled && interval < 1) {
            return toast("Recurrence interval must be at least 1");
        }

        const parsedCollaboratorEmails = collaboratorEmails
            .split(",")
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean);

        setSubmitting(true);

        const payload: any = {
            title: trimmedTitle,
            description: trimmedDescription,
            location: trimmedLocation,
            startDate: finalStart,
            endDate: finalEnd,
            priority,
            categoryId,
            notifyBefore,
            collaboratorEmails: mode === "create" ? parsedCollaboratorEmails : undefined,
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

        if (mode === "edit" && initialData?.creatorId) {
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
                const errorPayload = (await res.json().catch(() => null)) as { error?: string } | null;
                toast(errorPayload?.error ?? "Failed to save event");
                setSubmitting(false);
                return;
            }

            const saved = await res.json();
            toast(mode === "create" ? "Event created successfully." : "Event updated successfully.");

            if (onSuccess) onSuccess(saved);
            router.push(`/events/${saved.id}`);
        } catch (err) {
            console.error(err);
            toast("An error occurred");
        } finally {
            setSubmitting(false);
        }
    }

    const submitLabel = mode === "create" ? "Create Event" : "Update Event";

    if (loading) {
        return (
            <div className="flex justify-center p-10">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        );
    }

    const startDT = combineDateTime(startDate, startTime);
    const endDT = combineDateTime(endDate, endTime);

    const categoryName =
        categoryId ? categoryList.find((c) => c.id === categoryId)?.name ?? null : null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: MAIN FORM */}
            <div className="lg:col-span-8 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{mode === "create" ? "Create New Event" : "Edit Event"}</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    required
                                    placeholder="Event title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    required
                                    placeholder="Event description..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    required
                                    placeholder="Enter location..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            {/* Collaborators (still optional as labeled) */}
                            {mode === "create" && (
                                <div className="space-y-2">
                                    <Label htmlFor="collab">Invite collaborators (optional)</Label>
                                    <Input
                                        id="collab"
                                        placeholder="alice@mail.com, bob@mail.com"
                                        value={collaboratorEmails}
                                        onChange={(e) => setCollaboratorEmails(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Separate multiple emails with commas.
                                    </p>
                                </div>
                            )}

                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                <span className="truncate">{formatDateLabel(startDate)}</span>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label>End Date *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                <span className="truncate">{formatDateLabel(endDate)}</span>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Times */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startTime">Start Time *</Label>
                                    <Input
                                        id="startTime"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endTime">End Time *</Label>
                                    <Input
                                        id="endTime"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <EventPreviewCard
                                className="lg:hidden"
                                title={title}
                                description={description}
                                location={location}
                                categoryName={categoryName}
                                priority={priority}
                                startDT={startDT}
                                endDT={endDT}
                                notifyBefore={notifyBefore}
                                recurrenceEnabled={recurrenceEnabled}
                                frequency={frequency}
                                interval={interval}
                                collaboratorEmails={collaboratorEmails}
                                showCollaborators={mode === "create"}
                            />

                            {/* Submit */}
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? <span className="opacity-80">Saving...</span> : submitLabel}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* RIGHT: SETTINGS */}
            <div className="lg:col-span-4">
                <div className="space-y-6 lg:sticky lg:top-20">
                    <EventPreviewCard
                        className="hidden lg:block"
                        title={title}
                        description={description}
                        location={location}
                        categoryName={categoryName}
                        priority={priority}
                        startDT={startDT}
                        endDT={endDT}
                        notifyBefore={notifyBefore}
                        recurrenceEnabled={recurrenceEnabled}
                        frequency={frequency}
                        interval={interval}
                        collaboratorEmails={collaboratorEmails}
                        showCollaborators={mode === "create"}
                    />

                    {/* Category + Priority */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Event Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <Select
                                    value={categoryId ? String(categoryId) : ""}
                                    onValueChange={(v) => setCategoryId(Number(v))}
                                >
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
                                <p className="text-xs text-muted-foreground">Category is required.</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Priority *</Label>
                                <RadioGroup
                                    value={priority}
                                    onValueChange={(v) => setPriority(v as any)}
                                    className="space-y-2"
                                >
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

                    {/* Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Label htmlFor="notifyBefore">Notify Before (minutes) *</Label>
                            <Input
                                id="notifyBefore"
                                type="number"
                                required
                                value={notifyBefore}
                                onChange={(e) => setNotifyBefore(Number(e.target.value))}
                                min={0}
                                max={10080}
                            />
                            <p className="text-xs text-muted-foreground">0–10080 minutes (up to 7 days)</p>
                        </CardContent>
                    </Card>

                    {/* Recurrence (optional) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recurrence</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Enable recurrence</Label>
                                <Switch checked={recurrenceEnabled} onCheckedChange={setRecurrenceEnabled} />
                            </div>

                            {recurrenceEnabled && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
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

                                    <div className="space-y-2">
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
        </div>
    );
}