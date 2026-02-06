// app/calendar/page.tsx
import FullCalendarWrapper from "@/components/calendar/FullCalendarWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, ListChecks, Plus, Sparkles  } from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
            <section className="rounded-3xl border bg-linear-to-r from-sky-500/10 via-indigo-500/10 to-emerald-500/10 p-6 md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Planner
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                                <Sparkles className="h-3.5 w-3.5" />
                                Smart scheduling
                            </Badge>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                            Calendar
                        </h1>
                        <p className="text-slate-600">
                            Keep an eye on everything happening across your schedule and
                            jump into events with a single click.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/events" className="flex items-center gap-2">
                                <ListChecks className="h-4 w-4" />
                                List View
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/events/create" className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                New Event
                            </Link>
                        </Button>
                    </div>

                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="rounded-2xl border bg-white p-4 shadow-sm md:p-6">
                    <FullCalendarWrapper />
                </div>

                <aside className="space-y-4">
                    <div className="rounded-2xl border bg-white p-4 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Quick tips
                        </h3>
                        <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            <li>• Click any event to view details and collaborators.</li>
                            <li>• Toggle Month, Week, or Day views to zoom in.</li>
                            <li>• Drag events to reschedule quickly.</li>
                            <li>• Category colors keep priorities clear at a glance.</li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border bg-slate-900 p-4 text-sm text-slate-100 shadow-sm">
                        <p className="font-semibold">Pro tip</p>
                        <p className="mt-2 text-slate-200">
                            Use recurring events for habits and routines so you never
                            miss the important stuff.
                        </p>
                    </div>
                </aside>
            </section>
        </div>
    );
}