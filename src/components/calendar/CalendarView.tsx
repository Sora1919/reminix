// components/calendar/CalendarView.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Filter, Download, Users, Clock, Star } from "lucide-react";
import FullCalendarWrapper from "./FullCalendarWrapper";

export default function CalendarView() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalEvents: 0,
        thisMonth: 0,
        highPriority: 0,
        collaborations: 0
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        // You can fetch stats here if you want
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header with Stats */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                    <Calendar className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                        Event Calendar
                                    </h1>
                                    <p className="text-gray-600">
                                        Visualize and manage all your scheduled events
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push("/events")}
                                className="flex items-center gap-2 shadow-sm"
                            >
                                <Filter className="h-4 w-4" />
                                List View
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.print()}
                                className="flex items-center gap-2 shadow-sm"
                            >
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                            <Button
                                onClick={() => router.push("/events/create")}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center gap-2 shadow-lg"
                            >
                                <Plus className="h-4 w-4" />
                                New Event
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Events</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.totalEvents}</p>
                                </div>
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">This Month</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.thisMonth}</p>
                                </div>
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <Clock className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">High Priority</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.highPriority}</p>
                                </div>
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <Star className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Collaborations</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.collaborations}</p>
                                </div>
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Users className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar Container */}
                <div className="bg-white rounded-2xl shadow-xl border p-4 md:p-6 mb-8">
                    <FullCalendarWrapper />
                </div>

                {/* Tips Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Star className="h-5 w-5 text-blue-600" />
                        Calendar Tips
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium text-gray-800 mb-2">Click & Drag</h4>
                            <p className="text-sm text-gray-600">
                                Click and drag on empty calendar space to create new events quickly
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium text-gray-800 mb-2">Event Colors</h4>
                            <p className="text-sm text-gray-600">
                                Events are color-coded by priority and your role (creator vs collaborator)
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium text-gray-800 mb-2">Multiple Views</h4>
                            <p className="text-sm text-gray-600">
                                Switch between Month, Week, and Day views for different perspectives
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}