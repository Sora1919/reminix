import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold">Welcome {session.user?.name}</h1>
            <p className="text-gray-600 mt-2">Start by creating your first event.</p>
        </div>
    );
}
