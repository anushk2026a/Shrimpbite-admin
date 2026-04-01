"use client"

import { useState, useEffect } from "react"
import {
    ShoppingCart,
    Package,
    DollarSign,
    MoreVertical,
    Users,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Loader2,
} from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import retailerService from "@/data/services/retailerService"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export default function RetailerDashboard() {
    const queryClient = useQueryClient()
    const [mounted, setMounted] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)
    const { data: statsData, isLoading } = useQuery({
        queryKey: ["retailerDashboardStats"],
        queryFn: async () => {
            const res = await retailerService.getDashboardStats()
            if (res.success) {
                return res.data
            }
            throw new Error("Failed to fetch dashboard stats")
        },
        staleTime: 5 * 60 * 1000,
    })

    const shopActive = statsData?.stats?.isShopActive ?? false

    // mutation for shop toggle
    const toggleMutation = useMutation({
        mutationFn: () => retailerService.toggleShopStatus(),
        onMutate: async () => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["retailerDashboardStats"] })

            // Snapshot the previous value
            const previousStats = queryClient.getQueryData(["retailerDashboardStats"])

            // Optimistically update to the new value
            if (previousStats) {
                const casted = previousStats as any;
                queryClient.setQueryData(["retailerDashboardStats"], {
                    ...casted,
                    stats: {
                        ...casted.stats,
                        isShopActive: !shopActive
                    }
                })
            }

            if (!shopActive) {
                setShowConfetti(true)
                setTimeout(() => setShowConfetti(false), 4000)
            }

            return { previousStats }
        },
        onError: (error: any, newState, context) => {
            // Roll back to the previous value if mutation fails
            if (context?.previousStats) {
                queryClient.setQueryData(["retailerDashboardStats"], context.previousStats)
            }
            console.error("Mutation failed:", error)
            toast.error(error?.response?.data?.message || "Failed to update shop status")
        },
        onSettled: () => {
            // Always refetch after error or success to keep in sync with server
            queryClient.invalidateQueries({ queryKey: ["retailerDashboardStats"] })
        },
        onSuccess: (data) => {
            toast.success(`Shop storefront is now ${data.isShopActive ? 'OPEN' : 'CLOSED'}`)
        }
    })

    const actionLoading = toggleMutation.isPending

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleToggle = () => {
        toggleMutation.mutate()
    }

    if (!mounted || isLoading || !statsData) {
        return <div className="space-y-6 animate-pulse p-4">
            <div className="h-24 bg-background-soft rounded-[40px] w-full" />
            <div className="h-48 bg-background-soft rounded-[40px] w-full" />
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-background-soft rounded-2xl" />)}
            </div>
            <div className="h-80 bg-background-soft rounded-2xl" />
        </div>
    }

    const staticCards = [
        { title: "My Total Sales", value: `₹${statsData.stats.totalRevenue.toLocaleString()}`, change: "", trend: "up", icon: DollarSign, color: "bg-orange-50 text-orange-600 border-orange-100", shadow: "shadow-orange-500/10", href: "/retailer/revenue" },
        { title: "My Orders", value: statsData.stats.totalOrders.toLocaleString(), change: "", trend: "up", icon: ShoppingCart, color: "bg-red-50 text-red-600 border-red-100", shadow: "shadow-red-500/10", href: "/retailer/orders" },
        { title: "Active Products", value: statsData.stats.activeProducts.toLocaleString(), change: "", trend: "neutral", icon: Package, color: "bg-green-50 text-green-600 border-green-100", shadow: "shadow-green-500/10", href: "/retailer/products" },
        { title: "My Customers", value: statsData.stats.totalCustomers.toLocaleString(), change: "", trend: "up", icon: Users, color: "bg-purple-50 text-purple-600 border-purple-100", shadow: "shadow-purple-500/10", href: "/retailer/customers" },
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Branded Header Console */}
            <motion.div
                animate={{
                    boxShadow: shopActive ? "0 20px 40px -10px rgba(108, 197, 29, 0.2)" : "0 8px 30px rgba(0,0,0,0.04)",
                    borderColor: shopActive ? "rgba(108, 197, 29, 0.3)" : "rgba(226, 232, 240, 0.8)"
                }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[48px] border-2 shadow-sm relative overflow-hidden group"
            >
                {/* Decorative Brand Shapes */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#FF6B35] via-[#FF3B30] to-[#6CC51D] opacity-80" />
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-[#6CC51D] to-[#58a318] flex items-center justify-center text-white shadow-xl shadow-green-500/20 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-primary uppercase">Shop Console</h1>
                        <p className="text-text-muted mt-1 font-bold text-sm tracking-tight opacity-70">Logistics Hub & Strategic Operations</p>
                    </div>
                </div>

                <div className="flex items-center gap-8 relative z-10">
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3 opacity-60">Live Availability</p>
                        <div className="relative">
                            <button
                                onClick={handleToggle}
                                disabled={actionLoading}
                                className={cn(
                                    "flex items-center gap-4 px-8 py-3.5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.15em] transition-all border-2 relative z-10 overflow-hidden group/btn disabled:opacity-70",
                                    shopActive
                                        ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 shadow-[0_10px_20px_-5px_rgba(34,197,94,0.15)]"
                                        : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 shadow-[0_10px_20px_-5px_rgba(239,68,68,0.15)]"
                                )}
                            >
                                <div className="absolute inset-0 bg-white/40 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                                {actionLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]", shopActive ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                                )}
                                {actionLoading ? "Updating..." : shopActive ? "Storefront: ONLINE" : "Storefront: OFFLINE"}
                            </button>

                            {/* Particle Effect for "Shop Open" */}
                            <AnimatePresence>
                                {showConfetti && (
                                    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
                                        {[...Array(24)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ x: `${Math.random() * 100}vw`, y: -100, opacity: 0, scale: 0.5 + Math.random(), rotate: Math.random() * 360 }}
                                                animate={{ y: ["0vh", "120vh"], opacity: [0, 1, 0.8, 0], rotate: Math.random() * 720, x: `${(Math.random() * 100) + (Math.sin(i) * 10)}vw` }}
                                                transition={{ duration: 2 + Math.random() * 2, ease: [0.4, 0, 0.2, 1], delay: Math.random() * 0.5 }}
                                                className={cn(
                                                    "absolute w-3 h-3 rounded-sm shadow-[0_0_15px_rgba(108,197,29,0.5)]",
                                                    i % 3 === 0 ? "bg-primary" : i % 3 === 1 ? "bg-[#FF6B35]" : "bg-[#FF3B30]"
                                                )}
                                            />
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Prep List CTA - Muted Brand Green */}
            <Link
                href="/retailer/prep-list"
                className="block group relative overflow-hidden bg-[#58a318] rounded-[48px] p-10 text-white shadow-2xl shadow-green-900/10 hover:-translate-y-1 transition-all duration-500 border-b-4 border-black/10"
            >
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Package size={160} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-xl flex items-center justify-center border border-white/20">
                                <Package className="text-white" size={24} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90">Critical Daily Tasks</span>
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter">Inventory Prep List</h2>
                        <p className="mt-3 text-white/80 font-bold text-base max-w-lg leading-relaxed">Calculate and prepare exactly what your customers are expecting today. Minimize waste, maximize freshness.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white text-primary px-10 py-5 rounded-[28px] font-black uppercase tracking-[0.2em] text-xs shadow-xl group-hover:shadow-2xl transition-all group-hover:scale-105 active:scale-95">
                        View Calculations <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {staticCards.map((stat, index) => (
                    <Link key={index} href={stat.href} className={cn(
                        "bg-white p-7 rounded-[32px] border-2 border-transparent hover:border-gray-100 transition-all group text-foreground relative overflow-hidden",
                        stat.shadow
                    )}>
                        {/* Subtle inner corner accent */}
                        <div className={cn("absolute top-0 right-0 w-16 h-16 opacity-5 -mr-4 -mt-4 rounded-full", stat.color)} />

                        <div className="flex items-center justify-between mb-6 relative">
                            <div className={cn("p-4 rounded-2xl border transition-transform duration-500 group-hover:rotate-[10deg]", stat.color)}>
                                <stat.icon size={28} />
                            </div>
                        </div>
                        <p className="text-xs font-black text-text-muted mb-2 uppercase tracking-widest opacity-60">{stat.title}</p>
                        <div className="flex items-center gap-3 relative">
                            <h3 className="text-3xl font-black tracking-tight">{stat.value}</h3>
                            {stat.change && (
                                <span className="px-2 py-1 bg-green-50 text-green-500 rounded-lg text-[10px] font-black uppercase">
                                    {stat.change}
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border-custom shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Sales Performance (Last 7 Days)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={statsData.chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6CC51D" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6CC51D" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#868889" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#868889" }} />
                                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                                <Area type="monotone" dataKey="sales" stroke="#6CC51D" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold mb-6">Recent Shop Activity</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                                    <ShoppingCart size={18} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">New Orders: {statsData.stats.newOrders}</p>
                                    <p className="text-xs text-text-muted">In the last 24 hours</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                                    <Package size={18} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Active Products: {statsData.stats.activeProducts}</p>
                                    <p className="text-xs text-text-muted">Currently live</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Link href="/retailer/prep-list" className="block text-center mt-6 w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-sm font-bold text-gray-700">
                        View Prep List
                    </Link>
                </div>
            </div>
        </div>
    )
}
