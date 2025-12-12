// app/api/notifications/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
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

        const notifications = await prisma.notification.findMany({
            where: {
                userId: parseInt(session.user.id)
            },
            orderBy: { createdAt: "desc" },
            include: { event: true }
        });

        return NextResponse.json(notifications);
    } catch (e) {
        console.error("GET notifications error:", e);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await req.json();

        // Verify the notification belongs to the user
        const notification = await prisma.notification.findFirst({
            where: {
                id: id,
                userId: parseInt(session.user.id)
            }
        });

        if (!notification) {
            return NextResponse.json(
                { error: "Notification not found" },
                { status: 404 }
            );
        }

        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("PATCH notification error:", e);
        return NextResponse.json(
            { error: "Failed to mark as read" },
            { status: 500 }
        );
    }
}

// Add DELETE endpoint to clear notifications
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.notification.deleteMany({
            where: {
                userId: parseInt(session.user.id),
                isRead: true
            }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("DELETE notifications error:", e);
        return NextResponse.json(
            { error: "Failed to clear notifications" },
            { status: 500 }
        );
    }
}