"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ChatRoom from "@/components/chat/ChatRoom";

export default function ChatPage() {
    const { id } = useParams();

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6 md:py-6">
            {/* This wrapper forces the chat card to fit the screen */}
            <div className="flex h-[calc(100dvh-9rem)] flex-col md:h-[calc(100dvh-10rem)]">
                {/* Back */}
                <div className="mb-3">
                    <Button variant="ghost" asChild className="gap-2 px-2">
                        <Link href={`/events/${id}`}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to Event
                        </Link>
                    </Button>
                </div>

                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
                                Event Chat
                            </h1>
                            <p className="text-sm text-muted-foreground md:text-base">
                                Real-time chat with collaborators
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chat Card fills remaining height */}
                <Card className="flex-1 min-h-0 overflow-hidden border shadow-sm">
                    <Suspense
                        fallback={
                            <div className="flex h-full items-center justify-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary border-t-2" />
                            </div>
                        }
                    >
                        <ChatRoom />
                    </Suspense>
                </Card>
            </div>
        </div>
    );
}