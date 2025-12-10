"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function EventModal({ open, onOpenChange, event }: { open: boolean; onOpenChange: (v: boolean) => void; event: any }) {
    const router = useRouter();
    if (!event) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{event.title}</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm text-gray-600">{event.description}</p>

                    <div className="mt-4 space-y-2">
                        <div>
                            <strong>Start:</strong>{" "}
                            {new Date(event.startDate).toLocaleString()}
                        </div>
                        <div>
                            <strong>End:</strong>{" "}
                            {new Date(event.endDate).toLocaleString()}
                        </div>
                        {event.location && <div><strong>Location:</strong> {event.location}</div>}
                        {event.category?.name && <div><strong>Category:</strong> {event.category.name}</div>}
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="ghost" onClick={() => { onOpenChange(false); router.push(`/events/${event.id}`); }}>
                        View Details
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
