import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            include: {
                category: true,
                recurrence: true,
                collaborators: {
                    include: { user: true }
                },
                creator: true
            }
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
        console.log("📥 Incoming Event Data:", data);


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
            throw new Error("Invalid creatorId");
        }

        let recurrenceRecord = null;

        if (recurrence) {
            console.log("📌 Recurrence Received:", recurrence);
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
            throw new Error("Missing required fields");
        }


        console.log("📌 Creating event now...");
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

        console.log("✅ Event created:", event);
        return NextResponse.json(event);

    } catch (e) {
        console.error("POST /events error", e);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
