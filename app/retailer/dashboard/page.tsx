"use client"

import { useState, useEffect } from "react"
import {
    ShoppingCart,
    TrendingUp,
    TrendingDown,
    Package,
    DollarSign,
    MoreVertical,
    Users
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
import Link from "next/link"
import { cn } from "@/lib/utils"

const stats = [
    { title: "My Total Sales", value: "$4,250", change: "+12.5%", trend: "up", icon: DollarSign, color: "bg-primary-light text-primary", href: "/retailer/revenue" },
    { title: "My Orders", value: "85", change: "+5.4%", trend: "up", icon: ShoppingCart, color: "bg-blue-50 text-blue-600", href: "/retailer/orders" },
    { title: "Active Products", value: "24", change: "0%", trend: "neutral", icon: Package, color: "bg-green-50 text-green-600", href: "/retailer/products" },
    { title: "My Customers", value: "62", change: "+8.2%", trend: "up", icon: Users, color: "bg-purple-50 text-purple-600", href: "/retailer/customers" },
]

const chartData = [
    { name: "Mon", sales: 400 },
    { name: "Tue", sales: 300 },
    { name: "Wed", sales: 600 },
    { name: "Thu", sales: 800 },
    { name: "Fri", sales: 500 },
    { name: "Sat", sales: 900 },
    { name: "Sun", sales: 700 },
]

export default function RetailerDashboard() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <div className="space-y-6 animate-pulse" />

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Shop Overview</h1>
                <p className="text-text-muted">Track your shop's performance and inventory.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Link key={index} href={stat.href} className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-3 rounded-xl", stat.color)}>
                                <stat.icon size={24} />
                            </div>
                            <MoreVertical className="text-text-muted cursor-pointer group-hover:text-foreground" size={18} />
                        </div>
                        <p className="text-sm font-medium text-text-muted mb-1">{stat.title}</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                            <span className={cn(
                                "text-xs font-bold flex items-center mb-1",
                                stat.trend === "up" ? "text-primary" : "text-text-muted"
                            )}>
                                {stat.change}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border-custom shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Sales Performance</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
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

                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Recent Shop Activity</h3>
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                                    <ShoppingCart size={18} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Order #SHP-{1000 + i} Received</p>
                                    <p className="text-xs text-text-muted">{i * 10} minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
