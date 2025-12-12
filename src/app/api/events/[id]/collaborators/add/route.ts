// app/api/events/[id]/collaborators/add/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email, role = "editor" } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Parse IDs (NextAuth returns string, database uses number)
        const currentUserId = parseInt(session.user.id);
        const parsedEventId = parseInt(eventId);

        // Check if user exists by email
        const userToAdd = await prisma.user.findUnique({
            where: { email }
        });

        if (!userToAdd) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: parsedEventId },
            include: { collaborators: true }
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Check if current user is the event creator
        if (event.creatorId !== currentUserId) {
            return NextResponse.json(
                { error: "Only event creator can add collaborators" },
                { status: 403 }
            );
        }

        // Check if user is trying to add themselves
        if (userToAdd.id === currentUserId) {
            return NextResponse.json(
                { error: "You cannot add yourself as a collaborator" },
                { status: 400 }
            );
        }

        // Check if collaborator already exists
        const existingCollaborator = event.collaborators.find(
            c => c.userId === userToAdd.id
        );

        if (existingCollaborator) {
            return NextResponse.json(
                { error: "User is already a collaborator" },
                { status: 400 }
            );
        }

        // Add collaborator
        const collaborator = await prisma.collaborator.create({
            data: {
                eventId: parsedEventId,
                userId: userToAdd.id,
                role
            },
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
        });

        return NextResponse.json(collaborator);
    } catch (error) {
        console.error("Add collaborator error:", error);
        return NextResponse.json(
            { error: "Failed to add collaborator" },
            { status: 500 }
        );
    }
}