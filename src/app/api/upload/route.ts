// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { existsSync, mkdirSync } from "fs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file size (max 32MB)
        const MAX_FILE_SIZE = 32 * 1024 * 1024; // 32MB
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`
            }, { status: 400 });
        }

        // Get file extension
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

        // Generate unique filename
        const uniqueId = uuidv4();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${uniqueId}-${safeFileName}`;

        // Create uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        // Return file URL
        const fileUrl = `/uploads/${fileName}`;

        return NextResponse.json({
            success: true,
            url: fileUrl,
            name: file.name,
            size: file.size,
            type: file.type,
            extension: fileExtension,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}