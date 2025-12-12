// app/api/jobs/check-notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkAndCreateNotifications } from "@/lib/notification-service";

// Only allow admin or secure token
export async function GET(req: NextRequest) {
    // Check for secret token
    const authHeader = req.headers.get('authorization');
    const secretToken = process.env.CRON_SECRET_TOKEN;

    if (secretToken && authHeader !== `Bearer ${secretToken}`) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const count = await checkAndCreateNotifications();
        return NextResponse.json({
            success: true,
            notificationsCreated: count,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        console.error("Notification job error:", e);
        return NextResponse.json(
            { error: "Job failed", details: e instanceof Error ? e.message : String(e) },
            { status: 500 }
        );
    }
}