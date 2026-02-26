"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"
import { cn } from "@/lib/utils"
import { useState } from "react"

export default function RetailerLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    const [status, setStatus] = useState<string | null>(null)

    useEffect(() => {
        const fetchStatus = async () => {
            const userId = localStorage.getItem("userId")
            const role = localStorage.getItem("role")

            if (!userId || role !== "retailer") {
                router.replace("/login")
                return
            }

            try {
                const response = await fetch(`http://localhost:5000/api/auth/me/${userId}`)
                if (response.ok) {
                    const data = await response.json()
                    setStatus(data.status)
                    localStorage.setItem("status", data.status)

                    const path = window.location.pathname
                    if (data.status !== "approved" && path !== "/retailer/status") {
                        router.replace("/retailer/status")
                    }
                }
            } catch (error) {
                console.error("Error fetching status:", error)
            }
        }

        fetchStatus()
    }, [router])


    return (
        <div className="flex h-screen bg-background">
            {status === "approved" && <Sidebar />}
            <div className="flex-1 flex flex-col min-w-0">
                {status === "approved" && <Topbar />}
                <main className={cn("flex-1 overflow-y-auto overflow-x-hidden", status === "approved" ? "p-6" : "p-0")}>
                    {children}
                </main>
            </div>
        </div>
    )
}
