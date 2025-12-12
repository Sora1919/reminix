// app/api/cron/init/route.ts (or in a server startup script)
import { NextResponse } from "next/server";

export async function GET() {
    // This ensures cron jobs start when the app starts
    if (!global.cronStarted) {
        global.cronStarted = true;

        // Start cron jobs
        if (process.env.NODE_ENV === 'production') {
            // In production, use a proper job scheduler
            console.log('Cron jobs would be started in production');
        } else {
            // In development, you can still run them
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            require('@/lib/cron');
            console.log('Development cron jobs started');
        }
    }

    return NextResponse.json({ started: true });
}