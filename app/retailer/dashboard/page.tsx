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
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Branded Header Console */}
            <motion.div
                animate={{
                    boxShadow: shopActive ? "0 10px 25px -5px rgba(108, 197, 29, 0.15)" : "0 4px 15px rgba(0,0,0,0.03)",
                    borderColor: shopActive ? "rgba(108, 197, 29, 0.3)" : "rgba(226, 232, 240, 0.8)"
                }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border shadow-sm relative overflow-hidden group"
            >
                {/* Decorative Brand Shapes */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#FF6B35] via-[#FF3B30] to-[#6CC51D] opacity-80" />
                <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />

                <div className="relative z-10 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6CC51D] to-[#58a318] flex items-center justify-center text-white shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform duration-500">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-primary uppercase">Shop Console</h1>
                        <p className="text-text-muted text-xs tracking-tight">Logistics Hub & Strategic Operations</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="flex flex-col items-end">
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1 opacity-60">Live Availability</p>
                        <div className="relative">
                            <button
                                onClick={handleToggle}
                                disabled={actionLoading}
                                className={cn(
                                    "flex items-center gap-2.5 px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all border relative z-10 overflow-hidden group/btn disabled:opacity-70",
                                    shopActive
                                        ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 shadow-sm"
                                        : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 shadow-sm"
                                )}
                            >
                                <div className="absolute inset-0 bg-white/40 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                                {actionLoading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <div className={cn("w-2 h-2 rounded-full", shopActive ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                                )}
                                {actionLoading ? "Updating..." : shopActive ? "ONLINE" : "OFFLINE"}
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
                                                    "absolute w-2.5 h-2.5 rounded-sm shadow-sm",
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
                className="block group relative overflow-hidden bg-[#58a318] rounded-2xl p-4 sm:p-5 text-white shadow-md shadow-green-900/10 hover:-translate-y-0.5 transition-all duration-300 border-b-2 border-black/10"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-105 transition-transform duration-500">
                    <Package size={80} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-7 h-7 bg-white/20 rounded-lg backdrop-blur-md flex items-center justify-center border border-white/20">
                                <Package className="text-white" size={14} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">Critical Daily Tasks</span>
                        </div>
                        <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight">Inventory Prep List</h2>
                        <p className="mt-0.5 text-white/80 font-medium text-xs max-w-lg leading-snug">Calculate and prepare exactly what your customers are expecting today. Minimize waste, maximize freshness.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md group-hover:shadow-lg transition-all shrink-0">
                        View Calculations <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {staticCards.map((stat, index) => (
                    <Link key={index} href={stat.href} className={cn(
                        "bg-white p-4 rounded-xl border border-border-custom hover:border-gray-200 transition-all group text-foreground relative overflow-hidden shadow-sm",
                        stat.shadow
                    )}>
                        <div className="flex items-center justify-between mb-3 relative">
                            <div className={cn("p-2 rounded-lg border transition-transform duration-500 group-hover:rotate-[6deg]", stat.color)}>
                                <stat.icon size={18} />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wider">{stat.title}</p>
                        <div className="flex items-center gap-2 relative">
                            <h3 className="text-xl font-bold tracking-tight">{stat.value}</h3>
                            {stat.change && (
                                <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-[9px] font-bold uppercase">
                                    {stat.change}
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-border-custom shadow-sm">
                    <h3 className="text-sm font-bold mb-3">Sales Performance (Last 7 Days)</h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={statsData.chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6CC51D" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6CC51D" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#868889" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#868889" }} />
                                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 10px rgba(0,0,0,0.08)", fontSize: "11px" }} />
                                <Area type="monotone" dataKey="sales" stroke="#6CC51D" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-border-custom shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold mb-3">Recent Shop Activity</h3>
                        <div className="space-y-3">
                            <div className="flex gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                                    <ShoppingCart size={14} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold">New Orders: {statsData.stats.newOrders}</p>
                                    <p className="text-[10px] text-text-muted">In the last 24 hours</p>
                                </div>
                            </div>
                            <div className="flex gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                                    <Package size={14} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold">Active Products: {statsData.stats.activeProducts}</p>
                                    <p className="text-[10px] text-text-muted">Currently live</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Link href="/retailer/prep-list" className="block text-center mt-3 w-full py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-xs font-bold text-gray-700">
                        View Prep List
                    </Link>
                </div>
            </div>
        </div>
    )
}
