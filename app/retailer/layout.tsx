"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"

export default function RetailerLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    useEffect(() => {
        const role = localStorage.getItem("role")
        if (role !== "retailer") {
            router.replace("/login")
        }
    }, [router])

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar />
                <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
