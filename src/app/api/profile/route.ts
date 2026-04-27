import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { normalizeName } from "@/lib/auth/validation";

type ProfilePayload = {
    name?: string;
    image?: string | null;
};

function isValidImageRef(value: string) {
    const v = value.trim();

    // ✅ Allow images you uploaded to your app (stored in /public/uploads)
    if (v.startsWith("/uploads/")) return true;

    // ✅ Allow normal online URLs
    try {
        const url = new URL(v);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

async function getAuthedUserId() {
    const session = await getServerSession(authOptions);
    const id = session?.user?.id;

    if (!id) return null;
    return Number(id);
}

// ✅ GET /api/profile  (for loading profile)
export async function GET() {
    const userId = await getAuthedUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, image: true },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // return flat shape (what your Profile page expects)
    return NextResponse.json({
        name: user.name,
        email: user.email,
        image: user.image,
    });
}

async function updateProfile(req: Request) {
    const userId = await getAuthedUserId();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await req.json()) as ProfilePayload;
    const updates: { name?: string; image?: string | null } = {};

    // name
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

    // image
    if (payload.image === null) {
        updates.image = null;
    } else if (typeof payload.image === "string") {
        const trimmed = payload.image.trim();
        if (trimmed.length === 0) {
            updates.image = null;
        } else if (!isValidImageRef(trimmed)) {
            return NextResponse.json(
                { error: "Image must be a valid URL or an uploaded /uploads/... path" },
                { status: 400 }
            );
        } else {
            updates.image = trimmed;
        }
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json(
            { error: "No profile changes provided" },
            { status: 400 }
        );
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: updates,
        select: { name: true, email: true, image: true },
    });

    return NextResponse.json({
        name: user.name,
        email: user.email,
        image: user.image,
    });
}

// ✅ PUT /api/profile (your Profile page uses PUT)
export async function PUT(req: Request) {
    return updateProfile(req);
}

// ✅ keep PATCH also (in case you call PATCH elsewhere)
export async function PATCH(req: Request) {
    return updateProfile(req);
}