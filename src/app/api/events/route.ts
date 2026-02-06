// app/api/events/route.ts (UPDATED VERSION)
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
        const include = searchParams.get("include"); // New: control what to include

        // 3. BASE WHERE CLAUSE - USER CAN ONLY SEE THEIR EVENTS
        const whereClause: any = {
            OR: [
                { creatorId: currentUserId },
                { collaborators: { some: { userId: currentUserId } } }
            ]
        };

        // 4. APPLY ADDITIONAL FILTERS
        if (search) {
            whereClause.AND = whereClause.AND || [];
            whereClause.AND.push({
                OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } }
                ]
            });
        }

        // CATEGORY FILTER
        if (categoryId) {
            whereClause.AND = whereClause.AND || [];
            whereClause.AND.push({ categoryId: Number(categoryId) });
        }

        // PRIORITY FILTER
        if (priority) {
            whereClause.AND = whereClause.AND || [];
            whereClause.AND.push({ priority: priority.toUpperCase() });
        }

        // DATE RANGE FILTERS - FIXED for better performance
        if (start && end) {
            whereClause.AND = whereClause.AND || [];
            const startDate = new Date(start);
            const endDate = new Date(end);

            // Events that overlap with the range
            whereClause.AND.push({
                OR: [
                    // Events starting in range
                    {
                        AND: [
                            { startDate: { gte: startDate } },
                            { startDate: { lt: endDate } }
                        ]
                    },
                    // Events ending in range
                    {
                        AND: [
                            { endDate: { gte: startDate } },
                            { endDate: { lt: endDate } }
                        ]
                    },
                    // Events spanning across range
                    {
                        AND: [
                            { startDate: { lt: endDate } },
                            { endDate: { gt: startDate } }
                        ]
                    }
                ]
            });
        } else if (month && year) {
            whereClause.AND = whereClause.AND || [];
            whereClause.AND.push({
                startDate: {
                    gte: new Date(year, month - 1, 1),
                    lt: new Date(year, month, 1),
                }
            });
        }

        // 5. BUILD QUERY BASED ON WHAT WE NEED TO INCLUDE
        // Default: minimal fields for performance
        let queryOptions: any = {
            where: whereClause,
            orderBy: { startDate: 'asc' },
            take: 500 // Safety limit
        };

        if (include === "true") {
            // Full data with relations
            queryOptions.include = {
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
                }
            };
        } else {
            // Minimal fields for calendar/list views
            queryOptions.select = {
                id: true,
                title: true,
                description: true,
                startDate: true,
                endDate: true,
                location: true,
                priority: true,
                creatorId: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true
                    }
                }
            };
        }

        // 6. FETCH EVENTS
        const events = await prisma.event.findMany(queryOptions);

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
            collaboratorEmails,
        } = data;

        // 3. VALIDATE REQUIRED FIELDS
        if (!title || !startDate || !endDate) {
            return NextResponse.json(
                { error: "Missing required fields: title, startDate, endDate" },
                { status: 400 }
            );
        }

        const normalizedTitle = String(title).trim();
        if (normalizedTitle.length < 3) {
            return NextResponse.json(
                { error: "Title must be at least 3 characters" },
                { status: 400 }
            );
        }


        // 4. VALIDATE DATES
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format" },
                { status: 400 }
            );
        }

        if (start >= end) {
            return NextResponse.json(
                { error: "End date must be after start date" },
                { status: 400 }
            );
        }

        if (notifyBefore !== undefined) {
            const notifyValue = Number(notifyBefore);
            if (Number.isNaN(notifyValue) || notifyValue < 0 || notifyValue > 10080) {
                return NextResponse.json(
                    { error: "Notify before must be between 0 and 10080 minutes" },
                    { status: 400 }
                );
            }
        }

        // 5. HANDLE RECURRENCE
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

        // 6. CREATE EVENT
        const event = await prisma.event.create({
            data: {
                title: normalizedTitle,
                description,
                startDate: start,
                endDate: end,
                location,
                priority,
                categoryId: categoryId ? Number(categoryId) : null,
                notifyBefore,
                creatorId: currentUserId,
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

        const normalizedCollaboratorEmails = Array.isArray(collaboratorEmails)
            ? collaboratorEmails
                .map((email) => String(email).trim().toLowerCase())
                .filter(Boolean)
            : [];

        if (normalizedCollaboratorEmails.length > 0) {
            const uniqueEmails = [...new Set(normalizedCollaboratorEmails)];
            const collaboratorUsers = await prisma.user.findMany({
                where: {
                    email: {
                        in: uniqueEmails,
                    },
                    id: {
                        not: currentUserId,
                    },
                },
                select: {
                    id: true,
                    email: true,
                },
            });

            if (collaboratorUsers.length > 0) {
                await prisma.collaborator.createMany({
                    data: collaboratorUsers.map((user) => ({
                        eventId: event.id,
                        userId: user.id,
                        role: "editor",
                    })),
                    skipDuplicates: true,
                });

                await prisma.notification.createMany({
                    data: collaboratorUsers.map((user) => ({
                        userId: user.id,
                        eventId: event.id,
                        type: "COLLABORATOR_ADDED",
                        message: `You've been added to \"${event.title}\" as collaborator.`,
                    })),
                });
            }
        }

        return NextResponse.json(event, { status: 201 });

    } catch (e) {
        console.error("POST /events error", e);
        return NextResponse.json(
            { error: "Failed to create event", details: e instanceof Error ? e.message : String(e) },
            { status: 500 }
        );
    }
}