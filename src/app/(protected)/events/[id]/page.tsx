import EventDetail from "@/components/events/EventDetail";
import { use } from "react";


export default function Page(props: { params: Promise<{ id: string }> }) {
    const { id } = use(props.params);

    return (
        <div>
            <EventDetail id={id} />
        </div>
    )
}
