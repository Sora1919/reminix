// lib/uploadthing.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const f = createUploadthing();

export const ourFileRouter = {
    chatFileUpload: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
        pdf: { maxFileSize: "16MB", maxFileCount: 1 },
        text: { maxFileSize: "4MB", maxFileCount: 1 },
        video: { maxFileSize: "32MB", maxFileCount: 1 },
        audio: { maxFileSize: "16MB", maxFileCount: 1 },
    })
        .middleware(async ({ req }) => {
            const session = await getServerSession(authOptions);
            if (!session?.user) throw new Error("Unauthorized");
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { uploadedBy: metadata.userId, url: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;