// app/api/calendar/events/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const currentUserId = parseInt(session.user.id);

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const start = searchParams.get("start");
        const end = searchParams.get("end");

        if (!start || !end) {
            return NextResponse.json(
                { error: "Start and end dates are required" },
                { status: 400 }
            );
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        // Fetch events for calendar (optimized for calendar view)
        const events = await prisma.event.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { creatorId: currentUserId },
                            { collaborators: { some: { userId: currentUserId } } }
                        ]
                    },
                    {
                        OR: [
                            {
                                startDate: { gte: startDate, lt: endDate }
                            },
                            {
                                endDate: { gte: startDate, lt: endDate }
                            },
                            {
                                AND: [
                                    { startDate: { lt: endDate } },
                                    { endDate: { gt: startDate } }
                                ]
                            }
                        ]
                    }
                ]
            },

            select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true,
                priority: true,
                creatorId: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true
                    }
                }
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        return NextResponse.json(events);
    } catch (e) {
        console.error("GET /calendar/events error", e);
        return NextResponse.json(
            { error: "Failed to fetch calendar events" },
            { status: 500 }
        );
    }
}