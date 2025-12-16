// app/api/upload/route.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const f = createUploadthing();

export const ourFileRouter = {
    chatFileUpload: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
        pdf: { maxFileSize: "16MB", maxFileCount: 1 },
        video: { maxFileSize: "64MB", maxFileCount: 1 },
        audio: { maxFileSize: "16MB", maxFileCount: 1 },
        text: { maxFileSize: "4MB", maxFileCount: 1 },
        blob: { maxFileSize: "32MB", maxFileCount: 1 },
    })
        .middleware(async () => {
            const session = await getServerSession(authOptions);
            if (!session) throw new Error("Unauthorized");
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.url);
            return { uploadedBy: metadata.userId, fileUrl: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;