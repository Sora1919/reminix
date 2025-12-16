// components/ui/upload-dropzone.tsx
"use client";

import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
    onUpload: (file: File) => void;
    accept?: string;
    className?: string;
}

export function UploadDropzone({ onUpload, accept, className }: UploadDropzoneProps) {
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            onUpload(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div
            className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center",
                className
            )}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
        >
            <UploadCloud className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-2">Drag & drop files here</p>
            <p className="text-xs text-muted-foreground mb-4">
                or click to browse
            </p>
            <input
                type="file"
                className="hidden"
                id="file-upload"
                onChange={handleChange}
                accept={accept}
            />
            <Button
                variant="outline"
                type="button"
                onClick={() => document.getElementById("file-upload")?.click()}
            >
                Browse Files
            </Button>
        </div>
    );
}