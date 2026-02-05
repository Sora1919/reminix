import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { endOfWeek, formatDistanceToNow, startOfWeek } from "date-fns";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickActions from "@/components/dashboard/QuickActions";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import MiniCalendar from "@/components/dashboard/MiniCalendar";
import Notifications from "@/components/dashboard/Notifications";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import prisma from "@/lib/prisma"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const userId = Number(session.user.id);
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const [eventsThisWeek, completedEvents, collaborationsCount, unreadNotifications] =
        await Promise.all([
            prisma.event.count({
                where: {
                    creatorId: userId,
                    startDate: {
                        gte: weekStart,
                        lte: weekEnd,
                    },
                },
            }),
            prisma.event.count({
                where: {
                    creatorId: userId,
                    endDate: {
                        lt: now,
                    },
                },
            }),
            prisma.collaborator.count({
                where: { userId },
            }),
            prisma.notification.count({
                where: {
                    userId,
                    isRead: false,
                },
            }),
        ]);

    const upcomingEvents = await prisma.event.findMany({
        where: {
            creatorId: userId,
            startDate: {
                gte: now,
            },
        },
        orderBy: {
            startDate: "asc",
        },
        take: 5,
        include: {
            category: true,
        },
    });

    const recentNotifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
    });

    const recentEvents = await prisma.event.findMany({
        where: { creatorId: userId },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
    });

    const stats = {
        thisWeek: eventsThisWeek,
        completed: completedEvents,
        collaborations: collaborationsCount,
        notifications: unreadNotifications,
    };

    const upcomingEventItems = upcomingEvents.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.startDate.toISOString(),
        location: event.location ?? "TBA",
        category: event.category?.name ?? "General",
    }));

    const notificationItems = recentNotifications.map((notification) => ({
        id: notification.id,
        text: notification.message,
        time: formatDistanceToNow(notification.createdAt, { addSuffix: true }),
    }));

    const activityItems = recentEvents.map((event) => ({
        id: event.id,
        text: `You created event "${event.title}"`,
        time: formatDistanceToNow(event.createdAt, { addSuffix: true }),
    }));

    return (
        <div className="space-y-6">
            {/* Top row: stats + quick actions */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <StatsCard title="Events this week" value={stats.thisWeek} />
                    <StatsCard title="Completed" value={stats.completed} />
                    <StatsCard title="Collaborations" value={stats.collaborations} />
                    <StatsCard title="Notifications" value={stats.notifications} />
                </div>

                <div className="w-full lg:w-72">
                    <QuickActions />
                </div>
            </div>

            {/* Middle row: upcoming events + mini calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <UpcomingEvents events={upcomingEventItems} />
                </div>

                <div>
                    <MiniCalendar events={upcomingEventItems} />
                    <div className="mt-4">
                        <Notifications items={notificationItems} />
                    </div>
                </div>
            </div>

            {/* Bottom row: activity feed */}
            <div>
                <ActivityFeed items={activityItems} />
            </div>
        </div>
    );
}
