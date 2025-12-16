// app/events/[id]/chat/page.tsx
"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import ChatRoom from "@/components/chat/ChatRoom";
import { Suspense } from "react";

export default function ChatPage() {
    const { id } = useParams();

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Back Button */}
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href={`/events/${id}`} className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Event
                    </Link>
                </Button>
            </div>

            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Event Chat</h1>
                        <p className="text-muted-foreground">
                            Real-time chat with collaborators
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Room */}
            <Card className="border-0 shadow-lg overflow-hidden">
                <Suspense fallback={
                    <div className="flex items-center justify-center h-[600px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                }>
                    <ChatRoom />
                </Suspense>
            </Card>
        </div>
    );
}