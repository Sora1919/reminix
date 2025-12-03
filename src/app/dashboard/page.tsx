// import { auth } from "@/app/api/auth"; // next-auth helper for server
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    // const session = await auth();
    //
    // if (!session) {
    //     redirect("/login");
    // }

    return (
        <div>
            Protected Dashboard Content
        </div>
    );
}
