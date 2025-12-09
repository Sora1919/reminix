import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// --------------------- GET ---------------------
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    try {
        const event = await prisma.event.findUnique({
            where: { id: Number(id) },
            include: {
                recurrence: true,
                category: true,
                collaborators: { include: { user: true } }
            }
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json(event);
    } catch (e) {
        console.error("GET event error", e);
        return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
    }
}

// --------------------- PUT ---------------------
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params; // ADD 'await' HERE

    try {
        const data = await req.json();

        const {
            title,
            description,
            startDate,
            endDate,
            location,
            priority,
            categoryId,
            notifyBefore,
            recurrence
        } = data;

        let recurrenceIdToUse = undefined;

        // Handle recurrence updating or creation
        if (recurrence) {
            const existing = await prisma.event.findUnique({
                where: { id: Number(id) },
                select: { recurrenceId: true }
            });

            if (existing?.recurrenceId) {
                await prisma.recurrence.update({
                    where: { id: existing.recurrenceId },
                    data: {
                        frequency: recurrence.frequency,
                        interval: recurrence.interval,
                        byWeekdays: recurrence.byWeekdays ?? null,
                        count: recurrence.count ?? null,
                        until: recurrence.until ? new Date(recurrence.until) : null,
                    }
                });

                recurrenceIdToUse = existing.recurrenceId;
            } else {
                const newRec = await prisma.recurrence.create({
                    data: {
                        frequency: recurrence.frequency,
                        interval: recurrence.interval,
                        byWeekdays: recurrence.byWeekdays ?? null,
                        count: recurrence.count ?? null,
                        until: recurrence.until ? new Date(recurrence.until) : null,
                    }
                });

                recurrenceIdToUse = newRec.id;
            }
        } else {
            recurrenceIdToUse = null;
        }

        const updated = await prisma.event.update({
            where: { id: Number(id) },
            data: {
                title,
                description,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                location,
                priority,
                categoryId,
                notifyBefore,
                recurrenceId: recurrenceIdToUse,
            },
            include: { recurrence: true }
        });

        return NextResponse.json(updated);
    } catch (e) {
        console.error("PUT event error", e);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

// --------------------- DELETE ---------------------
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params; // ADD 'await' HERE

    try {
        const event = await prisma.event.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ success: true, deleted: event });
    } catch (e) {
        console.error("DELETE event error", e);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}