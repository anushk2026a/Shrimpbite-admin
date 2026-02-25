"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    useEffect(() => {
        const role = localStorage.getItem("role")
        if (role !== "admin") {
            router.replace("/login")
        }
    }, [router])

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar />
                <main className="p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}