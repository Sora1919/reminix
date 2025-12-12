// lib/notification-service.ts
import { prisma } from "@/lib/prisma";

export async function checkAndCreateNotifications() {
    const now = new Date();
    console.log(`[${now.toISOString()}] Checking notifications...`);

    const events = await prisma.event.findMany({
        where: {
            startDate: {
                gt: now // Only future events
            }
        },
        include: {
            collaborators: { include: { user: true } },
            creator: true,
            notifications: {
                select: { userId: true }
            }
        },
    });

    let createdCount = 0;

    for (const event of events) {
        if (!event.notifyBefore || event.notifyBefore <= 0) continue;

        const eventStart = new Date(event.startDate);
        const notifyTime = new Date(eventStart.getTime() - event.notifyBefore * 60_000);

        // Check if notification time has arrived
        if (now >= notifyTime && now < eventStart) {
            const usersToNotify = [
                event.creator,
                ...event.collaborators.map(c => c.user),
            ];

            // Filter users who haven't been notified for this event yet
            const existingNotifiedUserIds = new Set(
                event.notifications.map(n => n.userId)
            );

            for (const user of usersToNotify) {
                // Skip if already notified
                if (existingNotifiedUserIds.has(user.id)) continue;

                try {
                    await prisma.notification.create({
                        data: {
                            userId: user.id,
                            eventId: event.id,
                            message: `🔔 Reminder: "${event.title}" starts at ${eventStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                        },
                    });
                    createdCount++;
                } catch (error) {
                    console.error(`Failed to create notification for user ${user.id}:`, error);
                }
            }
        }
    }

    console.log(`Created ${createdCount} new notifications`);
    return createdCount;
}