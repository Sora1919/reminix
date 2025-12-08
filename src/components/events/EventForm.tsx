"use client";

import { useState } from "react";
import { addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import {CalendarIcon, Loader2} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {toast} from "sonner";

export default function CreateEventPage() {
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 1));
    const [startTime, setStartTime] = useState("12:00");
    const [endTime, setEndTime] = useState("12:00");


    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [priority, setPriority] = useState("MEDIUM");

    const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
    const [frequency, setFrequency] = useState("DAILY");
    const [interval, setInterval] = useState(1);
    const [notifyBefore, setNotifyBefore] = useState(30);

    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return (
            <div className="flex justify-center p-10">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        router.push("/login");
        return null;
    }

    function combineDateTime(date: Date | undefined, time: string) {
        if (!date || !time) return null;

        const [hours, minutes] = time.split(":").map(Number);

        const combined = new Date(date);
        combined.setHours(hours);
        combined.setMinutes(minutes);
        combined.setSeconds(0);

        return combined;
    }


    async function handleSubmit(e: any) {
        e.preventDefault();

        const finalStart = combineDateTime(startDate, startTime);
        const finalEnd = combineDateTime(endDate, endTime);

        const data = {
            title: e.target.title.value,
            description: e.target.description.value,
            location: e.target.location.value,
            startDate: finalStart,
            endDate : endDate,
            priority,
            categoryId,
            notifyBefore,
            creatorId: Number(session.user?.id),

            recurrence: recurrenceEnabled
                ? {
                    frequency,
                    interval,
                    byWeekdays: null,
                    count: null,
                    until: null
                }
                : null
        };

        const res = await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });




        if (res.ok) toast("Event created successfully.", {
            description: "Event created",
        });
        else toast("Event created failed", {
            description: "Error creating event",
        })
    }

    return (
        <div className="flex gap-6 p-6">

            {/* LEFT COLUMN — MAIN EVENT INFO */}
            <div className="w-2/3 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Event</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Title */}
                            <div>
                                <Label>Title</Label>
                                <Input name="title" required placeholder="Event title..." />
                            </div>

                            {/* Description */}
                            <div>
                                <Label>Description</Label>
                                <Textarea name="description" placeholder="Event description..." />
                            </div>

                            {/* Location */}
                            <div>
                                <Label>Location</Label>
                                <Input name="location" placeholder="Optional location..." />
                            </div>

                            {/* Date Pickers */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Start Date */}
                                <div>
                                    <Label>Start Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                            >
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
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                            >
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
                            <Button type="submit" className="w-full">
                                Create Event
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
                                    <SelectItem value="1">Work</SelectItem>
                                    <SelectItem value="2">Personal</SelectItem>
                                    <SelectItem value="3">Health</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority */}
                        <div>
                            <Label>Priority</Label>
                            <RadioGroup value={priority} onValueChange={setPriority}>
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
                                    <Select value={frequency} onValueChange={setFrequency}>
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
