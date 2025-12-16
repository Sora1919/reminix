// app/api/events/[id]/chat/stream/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Store active connections
const connections = new Map<number, TransformStream[]>();

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const currentUserId = parseInt(session.user.id);
        const eventId = parseInt(id);

        // Check access
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                collaborators: true,
            },
        });

        if (!event) {
            return new NextResponse("Event not found", { status: 404 });
        }

        const hasAccess =
            event.creatorId === currentUserId ||
            event.collaborators.some(c => c.userId === currentUserId);

        if (!hasAccess) {
            return new NextResponse("Access denied", { status: 403 });
        }

        // Create SSE stream
        const stream = new TransformStream();
        const writer = stream.writable.getWriter();
        const encoder = new TextEncoder();

        // Store connection
        if (!connections.has(eventId)) {
            connections.set(eventId, []);
        }
        connections.get(eventId)!.push(stream);

        // Send initial connection message
        const initialData = {
            type: "connected",
            data: { userId: currentUserId, timestamp: new Date().toISOString() },
        };

        writer.write(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));

        // Handle client disconnect
        req.signal.addEventListener("abort", () => {
            const streams = connections.get(eventId);
            if (streams) {
                const index = streams.indexOf(stream);
                if (index > -1) {
                    streams.splice(index, 1);
                }
                if (streams.length === 0) {
                    connections.delete(eventId);
                }
            }
            writer.close();
        });

        // Keep connection alive with ping
        const pingInterval = setInterval(() => {
            const pingData = {
                type: "ping",
                data: { timestamp: new Date().toISOString() },
            };
            writer.write(encoder.encode(`data: ${JSON.stringify(pingData)}\n\n`));
        }, 30000); // Every 30 seconds

        // Cleanup on disconnect
        writer.closed.then(() => {
            clearInterval(pingInterval);
        });

        return new Response(stream.readable, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        console.error("SSE error:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

// Helper function to broadcast to all connections for an event
export function broadcastToEvent(eventId: number, data: any) {
    const streams = connections.get(eventId);
    if (!streams) return;

    const message = `data: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();

    streams.forEach(stream => {
        const writer = stream.writable.getWriter();
        writer.write(encoder.encode(message));
        writer.releaseLock();
    });
}