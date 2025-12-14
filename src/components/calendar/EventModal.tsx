// components/calendar/EventModal.tsx
"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Tag, Users, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EventModal({
                                       open,
                                       onOpenChange,
                                       event
                                   }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    event: any;
}) {
    const router = useRouter();

    if (!event) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg">{event.title}</DialogTitle>
                    <DialogDescription className="line-clamp-2">
                        {event.description || "No description"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    {/* Date & Time */}
                    <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-gray-700">Date & Time</p>
                            <div className="text-sm text-gray-600">
                                <p>Start: {formatDate(event.startDate)}</p>
                                <p>End: {formatDate(event.endDate)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    {event.location && (
                        <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Location</p>
                                <p className="text-sm text-gray-600">{event.location}</p>
                            </div>
                        </div>
                    )}

                    {/* Category */}
                    {event.category && (
                        <div className="flex items-start gap-3">
                            <Tag className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Category</p>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: event.category.color || "#4CAF50" }}
                                    />
                                    <span className="text-sm text-gray-600">{event.category.name}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Priority */}
                    {event.priority && (
                        <div className="flex items-start gap-3">
                            <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Priority</p>
                                <span className={`inline-block px-2 py-1 text-xs rounded ${
                                    event.priority === "HIGH"
                                        ? "bg-red-100 text-red-800"
                                        : event.priority === "MEDIUM"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-green-100 text-green-800"
                                }`}>
                                    {event.priority}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => {
                            onOpenChange(false);
                            router.push(`/events/${event.id}`);
                        }}
                    >
                        View Details
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}