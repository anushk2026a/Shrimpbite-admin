"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"
import useAuthStore from "@/data/store/useAuthStore"
import ForcePasswordReset from "@/components/auth/ForcePasswordReset"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { user, checkAuth, loading } = useAuthStore()

    useEffect(() => {
        const verifyAdmin = async () => {
            if (loading) return

            if (!user) {
                const token = localStorage.getItem("token")
                const role = localStorage.getItem("role")
                if (token && role === "admin") {
                    await checkAuth()
                } else {
                    router.replace("/login")
                }
                return
            }

            if (user.role !== "admin") {
                router.replace("/login")
            }
        }
        verifyAdmin()
    }, [user, router, loading, checkAuth])

    const [mounted, setMounted] = useState(false)
    const [dismissedReset, setDismissedReset] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    }

    return (
        <div className="flex h-screen relative">
            {user?.isPasswordResetRequired && !dismissedReset && (
                <ForcePasswordReset onClose={() => setDismissedReset(true)} />
            )}
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