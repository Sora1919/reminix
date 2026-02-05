import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { normalizeName } from "@/lib/auth/validation";

type ProfilePayload = {
    name?: string;
    image?: string | null;
};

function isValidUrl(value: string) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await req.json()) as ProfilePayload;
    const updates: { name?: string; image?: string | null } = {};

    if (typeof payload.name === "string") {
        const normalizedName = normalizeName(payload.name);
        if (normalizedName.length < 2 || normalizedName.length > 50) {
            return NextResponse.json(
                { error: "Name must be between 2 and 50 characters" },
                { status: 400 }
            );
        }
        updates.name = normalizedName;
    }

    if (typeof payload.image === "string") {
        const trimmedImage = payload.image.trim();
        if (trimmedImage.length === 0) {
            updates.image = null;
        } else if (!isValidUrl(trimmedImage)) {
            return NextResponse.json(
                { error: "Image must be a valid URL" },
                { status: 400 }
            );
        } else {
            updates.image = trimmedImage;
        }
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json(
            { error: "No profile changes provided" },
            { status: 400 }
        );
    }

    const user = await prisma.user.update({
        where: { id: Number(session.user.id) },
        data: updates,
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
    });

    return NextResponse.json({ user });
}