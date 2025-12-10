import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toast } from "sonner";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const month = Number(searchParams.get("month"));
        const year = Number(searchParams.get("year"));
        const start = searchParams.get("start"); // ISO string
        const end = searchParams.get("end");     // ISO string

        const whereClause: any = {};

        if (start && end) {
            whereClause.startDate = {
                gte: new Date(start),
                lt: new Date(end),
            };
        } else if (month && year) {
            whereClause.startDate = {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
            };
        }

        const events = await prisma.event.findMany({
            where: whereClause,
            include: {
                category: true,
                recurrence: true,
                collaborators: { include: { user: true } },
                creator: true,
            },
        });

        return NextResponse.json(events);
    } catch (e) {
        console.error("GET /events error", e);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

export async function POST(req: Request) {
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
            creatorId,
            recurrence, // { frequency, interval, byWeekdays, count, until }
        } = data;

        const creatorIdNumber = Number(creatorId);

        if (!creatorIdNumber) {
            toast.error("Invalid creator id");
        }

        let recurrenceRecord = null;

        if (recurrence) {
            recurrenceRecord = await prisma.recurrence.create({
                data: {
                    frequency: recurrence.frequency,
                    interval: recurrence.interval ?? 1,
                    byWeekdays: recurrence.byWeekdays ?? null,
                    count: recurrence.count ?? null,
                    until: recurrence.until ? new Date(recurrence.until) : null,
                }
            });
        }

        if (!title || !startDate || !endDate || !creatorId) {
            toast.error("Missing required fields");
        }
        const event = await prisma.event.create({
            data: {
                title,
                description,
                startDate: new Date(startDate as string),
                endDate: new Date(endDate as string),
                location,
                priority,
                categoryId,
                notifyBefore,
                creatorId : creatorIdNumber,
                recurrenceId: recurrenceRecord?.id ?? null,
            },
            include: {
                recurrence: true,
                category: true,
            }
        });
        return NextResponse.json(event);

    } catch (e) {
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}


