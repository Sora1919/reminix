import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        // 1. CHECK AUTHENTICATION FIRST
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const currentUserId = parseInt(session.user.id);

        // 2. GET QUERY PARAMS
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get("categoryId");
        const priority = searchParams.get("priority");
        const month = Number(searchParams.get("month"));
        const year = Number(searchParams.get("year"));
        const start = searchParams.get("start");
        const end = searchParams.get("end");
        const search = searchParams.get("search");

        // 3. BASE WHERE CLAUSE - USER CAN ONLY SEE THEIR EVENTS
        const whereClause: any = {
            OR: [
                // Events created by the user
                { creatorId: currentUserId },
                // Events where user is a collaborator
                {
                    collaborators: {
                        some: {
                            userId: currentUserId
                        }
                    }
                }
            ]
        };

        // 4. APPLY ADDITIONAL FILTERS
        if (search) {
            whereClause.AND = [
                ...(whereClause.AND || []),
                {
                    OR: [
                        { title: { contains: search, mode: "insensitive" } },
                        { description: { contains: search, mode: "insensitive" } }
                    ]
                }
            ];
        }

        // CATEGORY FILTER
        if (categoryId) {
            whereClause.AND = [
                ...(whereClause.AND || []),
                { categoryId: Number(categoryId) }
            ];
        }

        // PRIORITY FILTER
        if (priority) {
            whereClause.AND = [
                ...(whereClause.AND || []),
                { priority: priority.toUpperCase() }
            ];
        }

        // DATE RANGE FILTERS
        if (start && end) {
            whereClause.AND = [
                ...(whereClause.AND || []),
                {
                    startDate: {
                        gte: new Date(start),
                        lt: new Date(end),
                    }
                }
            ];
        } else if (month && year) {
            whereClause.AND = [
                ...(whereClause.AND || []),
                {
                    startDate: {
                        gte: new Date(year, month - 1, 1),
                        lt: new Date(year, month, 1),
                    }
                }
            ];
        }

        // 5. FETCH EVENTS WITH FILTERS
        const events = await prisma.event.findMany({
            where: whereClause,
            include: {
                category: true,
                recurrence: true,
                collaborators: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        }
                    }
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        return NextResponse.json(events);
    } catch (e) {
        console.error("GET /events error", e);
        return NextResponse.json(
            { error: "Failed to fetch events" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        // 1. CHECK AUTHENTICATION FOR CREATE TOO
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const currentUserId = parseInt(session.user.id);

        // 2. PARSE REQUEST DATA
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
            recurrence,
        } = data;

        // 3. VALIDATE REQUIRED FIELDS
        if (!title || !startDate || !endDate) {
            return NextResponse.json(
                { error: "Missing required fields: title, startDate, endDate" },
                { status: 400 }
            );
        }

        // 4. HANDLE RECURRENCE
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

        // 5. CREATE EVENT - Use authenticated user's ID
        const event = await prisma.event.create({
            data: {
                title,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                location,
                priority,
                categoryId: categoryId ? Number(categoryId) : null,
                notifyBefore,
                creatorId: currentUserId, // Use authenticated user
                recurrenceId: recurrenceRecord?.id ?? null,
            },
            include: {
                recurrence: true,
                category: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json(event, { status: 201 });

    } catch (e) {
        console.error("POST /events error", e);
        return NextResponse.json(
            { error: "Failed to create event", details: e instanceof Error ? e.message : String(e) },
            { status: 500 }
        );
    }
}