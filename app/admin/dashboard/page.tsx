"use client"

import { useState, useEffect } from "react"

import {
    ShoppingCart,
    TrendingUp,
    TrendingDown,
    Package,
    MoreVertical,
    Plus,
    Filter,
    RefreshCw,
} from "lucide-react"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts"
import Link from "next/link"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"

// Custom Icons for stats that aren't in lucide-react or need specific naming
function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    )
}

import { useQuery, useQueryClient } from "@tanstack/react-query"

export default function Dashboard() {
    const queryClient = useQueryClient()
    const [mounted, setMounted] = useState(false)

    // Using React Query for dashboard stats fetching & caching
    const { data: statsData, isLoading: loading } = useQuery({
        queryKey: ["adminDashboardStats"],
        queryFn: async () => {
            const res = await adminService.getDashboardStats()
            return res.data
        },
        staleTime: 5 * 60 * 1000, // Dashboard stats are fine to be 5 min stale
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || loading || !statsData) {
        return <div className="space-y-6 animate-pulse text-foreground">
            <div className="h-20 bg-background-soft rounded-2xl w-1/3" />
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-background-soft rounded-2xl" />)}
            </div>
            <div className="h-80 bg-background-soft rounded-2xl" />
        </div>
    }

    const staticCards = [
        {
            title: "Total Orders",
            value: statsData.stats.totalOrders.toLocaleString(),
            change: "",
            trend: "up",
            icon: ShoppingCart,
            color: "bg-orange-50 text-orange-600 border-orange-100",
            shadow: "shadow-orange-500/10",
            href: "/admin/orders"
        },
        {
            title: "New Orders (24h)",
            value: statsData.stats.newOrders.toLocaleString(),
            change: "",
            trend: "up",
            icon: Package,
            color: "bg-red-50 text-red-600 border-red-100",
            shadow: "shadow-red-500/10",
            href: "/admin/orders"
        },
        {
            title: "Completed Orders",
            value: statsData.stats.completedOrders.toLocaleString(),
            change: "",
            trend: "up",
            icon: ShieldCheckIcon,
            color: "bg-green-50 text-green-600 border-green-100",
            shadow: "shadow-green-500/10",
            href: "/admin/orders"
        },
        {
            title: "Canceled Orders",
            value: statsData.stats.canceledOrders.toLocaleString(),
            change: "",
            trend: "down",
            icon: TrashIcon,
            color: "bg-purple-50 text-purple-600 border-purple-100",
            shadow: "shadow-purple-500/10",
            href: "/admin/orders"
        }
    ]

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Branded Admin Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-border-custom shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#FF6B35] via-[#FF3B30] to-[#6CC51D] opacity-80" />
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-[#FF6B35]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#FF6B35]/10 transition-colors duration-700" />
                
                <div className="relative z-10 flex items-center justify-between w-full">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6CC51D] to-[#58a318] flex items-center justify-center text-white shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform duration-500">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-primary uppercase">Platform Overview</h1>
                            <p className="text-text-muted text-xs tracking-tight">Welcome back, Admin. Monitoring all live metrics.</p>
                        </div>
                    </div>

                    {/* Manual Sync Trigger */}
                    <button 
                        onClick={async () => {
                            const confirmSync = confirm("This will manually trigger order generation for today. Proceed?");
                            if (!confirmSync) return;
                            
                            try {
                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api.shrimpbite.in/api"}/cron/generate-subscription-orders`, {
                                    headers: { "x-cron-secret": "shrimpbite_cron_2026_secure" }
                                });
                                const data = await res.json();
                                if (data.success) {
                                    alert(`Success! Created ${data.stats.created} orders, Skipped ${data.stats.skipped}.`);
                                    window.location.reload();
                                } else {
                                    alert(`Failed: ${data.message}`);
                                }
                            } catch (err) {
                                alert("Failed to connect to sync service.");
                            }
                        }}
                        className="flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary hover:text-white transition-all shadow-sm border border-primary/20"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Sync Daily Orders
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
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
                        </div>
                        <p className="text-[10px] font-medium text-text-muted mt-1 uppercase tracking-wider opacity-60">System-wide Total</p>
                    </Link>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-border-custom shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-bold">Platform Orders</h3>
                            <p className="text-xs text-text-muted">Overall performance tracking (Last 7 Days)</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-background-soft p-1 rounded-md">
                            <button className="px-2.5 py-0.5 text-xs font-medium bg-white shadow-sm rounded">Last 7 Days</button>
                        </div>
                    </div>
                    <div className="h-[200px] w-full min-h-0 min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={statsData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6CC51D" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6CC51D" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBEB" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: "#868889" }}
                                    dy={5}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: "#868889" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "none",
                                        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                                        fontSize: "11px"
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#6CC51D"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorOrders)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-border-custom shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold mb-3">Recent Shop Activities</h3>
                        <div className="space-y-3">
                            {statsData.recentShops.length === 0 ? (
                                <p className="text-xs text-text-muted">No recent activities.</p>
                            ) : (
                                statsData.recentShops.map((shop: any, i: number) => (
                                    <div key={i} className="flex gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                                            <ShoppingCart size={13} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-foreground leading-tight">New Shop Signed: {shop.businessDetails?.businessName || shop.name}</p>
                                            <p className="text-[10px] text-text-muted">{new Date(shop.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <Link href="/admin/shops" className="block text-center w-full mt-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-background-soft transition-all text-text-muted hover:text-foreground">
                        View All Platform Activities
                    </Link>
                </div>
            </div>
        </div>
    )
}
