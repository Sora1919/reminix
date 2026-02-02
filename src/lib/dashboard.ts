import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";

export async function getDashboardData(userId: number) {
    const now = new Date();

    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const [
        eventsThisWeek,
        completedEvents,
        collaborations,
        upcomingEvents,
        notifications,
    ] = await Promise.all([
        prisma.event.count({
            where: {
                creatorId: userId,
                startDate: { gte: weekStart, lte: weekEnd },
            },
        }),

        prisma.event.count({
            where: {
                creatorId: userId,
                endDate: { lt: now },
            },
        }),

        prisma.collaborator.count({
            where: { userId },
        }),

        prisma.event.findMany({
            where: {
                OR: [
                    { creatorId: userId },
                    { collaborators: { some: { userId } } },
                ],
                startDate: { gte: now },
            },
            orderBy: { startDate: "asc" },
            take: 5,
            include: { category: true },
        }),

        prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
    ]);

    return {
        stats: {
            thisWeek: eventsThisWeek,
            completed: completedEvents,
            collaborations,
            notifications: notifications.length,
        },
        upcomingEvents,
        notifications,
    };
}
