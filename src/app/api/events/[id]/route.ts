import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: any) {
    try {
        const event = await prisma.event.findUnique({
            where: { id: Number(params.id) },
            include: {
                recurrence: true,
                category: true,
                collaborators: { include: { user: true } }
            }
        });

        return NextResponse.json(event);
    } catch (e) {
        console.error("GET event error", e);
        return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: any) {
    try {
        const id = Number(params.id);
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

        if (recurrence) {
            // If event has existing recurrence, update it.
            const existing = await prisma.event.findUnique({
                where: { id },
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
            where: { id },
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

export async function DELETE(_: Request, { params }: any) {
    try {
        const id = Number(params.id);

        const event = await prisma.event.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, deleted: event });
    } catch (e) {
        console.error("DELETE event error", e);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
