"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"
import { cn } from "@/lib/utils"
import useAuthStore from "@/data/store/useAuthStore"

export default function RetailerLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    const { user, checkAuth, loading } = useAuthStore()

    useEffect(() => {
        const verifyStatus = async () => {
            // If store is still loading (either login or checkAuth is in progress), wait.
            if (loading) return

            // If user isn't in store, try checkAuth
            if (!user) {
                const userId = localStorage.getItem("userId")
                const token = localStorage.getItem("token")

                if (userId && token) {
                    await checkAuth()
                } else {
                    router.replace("/login")
                }
                return
            }

            // At this point user exists
            if (user.role !== "retailer") {
                router.replace("/login")
                return
            }

            const path = window.location.pathname
            if (user.status !== "approved" && path !== "/retailer/status") {
                router.replace("/retailer/status")
            }
        }

        verifyStatus()
    }, [user, router, checkAuth, loading])

    const status = user?.status || null;

    if (loading || (!user && localStorage.getItem("token"))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <div className="w-10 h-10 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] rounded-full animate-spin" />
            </div>
        )
    }


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
