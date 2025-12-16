import EventDetail from "@/components/events/EventDetail";
import { use } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page(props: { params: Promise<{ id: string }> }) {
    const { id } = use(props.params);

    return (
        <div>
            <EventDetail id={id} />

            <Button asChild variant="outline">
                <Link href={`/events/${id}/chat`} className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Open Chat
                </Link>
            </Button>
        </div>
    )
}
