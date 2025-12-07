import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickActions from "@/components/dashboard/QuickActions";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import MiniCalendar from "@/components/dashboard/MiniCalendar";
import Notifications from "@/components/dashboard/Notifications";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const mockStats = {
        thisWeek: 12,
        completed: 5,
        collaborations: 3,
        notifications: 8,
    };

    const mockEvents = [
        { id: 1, title: "Sprint Planning", date: "2025-12-06T09:00:00.000Z", location: "Zoom", category: "Meeting" },
        { id: 2, title: "Design Review", date: "2025-12-07T13:00:00.000Z", location: "Room A", category: "Review" },
        { id: 3, title: "User Testing", date: "2025-12-08T15:30:00.000Z", location: "Lab", category: "Testing" },
    ];

    const mockNotifications = [
        { id: 1, text: "Alice invited you to Event: Design Review", time: "2h" },
        { id: 2, text: "Reminder: Sprint Planning in 1 hour", time: "3h" },
    ];

    const mockActivities = [
        { id: 1, text: "You created event 'Sprint Planning'", time: "1d" },
        { id: 2, text: "Bob joined 'Design Review' as collaborator", time: "2d" },
    ];

    return (
        <div className="space-y-6">
            {/* Top row: stats + quick actions */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <StatsCard title="Events this week" value={mockStats.thisWeek} />
                    <StatsCard title="Completed" value={mockStats.completed} />
                    <StatsCard title="Collaborations" value={mockStats.collaborations} />
                    <StatsCard title="Notifications" value={mockStats.notifications} />
                </div>

                <div className="w-full lg:w-72">
                    <QuickActions />
                </div>
            </div>

            {/* Middle row: upcoming events + mini calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <UpcomingEvents events={mockEvents} />
                </div>

                <div>
                    <MiniCalendar events={mockEvents} />
                    <div className="mt-4">
                        <Notifications items={mockNotifications} />
                    </div>
                </div>
            </div>

            {/* Bottom row: activity feed */}
            <div>
                <ActivityFeed items={mockActivities} />
            </div>
        </div>
    );
}
