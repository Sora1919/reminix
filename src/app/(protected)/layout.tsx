import { ReactNode } from "react"
import AppSidebar from "@/components/dashboard/sidebar"
import Navbar from "@/components/dashboard/navbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-muted/40">
                <Navbar />
                <main className="flex-1 p-4 md:p-6">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    )
}