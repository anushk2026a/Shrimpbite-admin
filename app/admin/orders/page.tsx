"use client"

import { useState } from "react"
import {
    Search,
    Filter,
    ArrowUpDown,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Eye,
    Trash2,
    Calendar,
    Download,
    Plus
} from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
    { title: "Total Orders", value: "1,240", change: "+14.4%", trend: "up", color: "bg-primary-light text-primary" },
    { title: "New Orders", value: "240", change: "+20%", trend: "up", color: "bg-blue-50 text-blue-600" },
    { title: "Completed Orders", value: "960", change: "85%", trend: "up", color: "bg-green-50 text-green-600" },
    { title: "Canceled Orders", value: "87", change: "-5%", trend: "down", color: "bg-red-50 text-red-600" },
]

const orders = [
    { id: "#ORD0001", product: "2kg Whiteleg Shrimp (40/50 count)", image: "https://images.unsplash.com/photo-1559742811-822873691df8?q=80&w=100&h=100&auto=format&fit=crop", date: "24-02-2026", price: "48.00", payment: "Paid", status: "Delivered" },
    { id: "#ORD0002", product: "1kg Premium Tiger Shrimp (Head-on)", image: "https://images.unsplash.com/photo-1515141982883-c7ad0e69fd62?q=80&w=100&h=100&auto=format&fit=crop", date: "25-02-2026", price: "32.50", payment: "Unpaid", status: "Pending" },
    { id: "#ORD0003", product: "500g Peeled & Deveined Shrimp", image: "https://images.unsplash.com/photo-1582982200325-188b3f2be666?q=80&w=100&h=100&auto=format&fit=crop", date: "25-02-2026", price: "18.99", payment: "Paid", status: "Delivered" },
    { id: "#ORD0004", product: "3kg Fresh White Shrimp (Bulk)", image: "https://images.unsplash.com/photo-1504362141-86a07604321c?q=80&w=100&h=100&auto=format&fit=crop", date: "25-02-2026", price: "64.00", payment: "Paid", status: "Shipped" },
    { id: "#ORD0005", product: "1kg Indian Sea Bass (Whole)", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?q=80&w=100&h=100&auto=format&fit=crop", date: "25-02-2026", price: "24.99", payment: "Unpaid", status: "Pending" },
]

const statusStyles: any = {
    "Delivered": "bg-green-50 text-green-600 border-green-100",
    "Pending": "bg-warning-50 text-warning border-warning-100",
    "Shipped": "bg-blue-50 text-blue-600 border-blue-100",
    "Cancelled": "bg-red-50 text-red-600 border-red-100",
}

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState("All order")

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary transition-all text-sm font-medium">
                        <Plus size={16} />
                        Add Order
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-background-soft transition-all text-sm font-medium">
                        More Action
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4 overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-text-muted">{stat.title}</p>
                            <button className="text-text-muted hover:text-foreground">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                        <div className="flex items-end gap-3">
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                            <span className={cn(
                                "text-xs font-bold px-2 py-0.5 rounded-full mb-1 flex items-center gap-1",
                                stat.trend === "up" ? "text-primary" : "text-red-500"
                            )}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">Last 7 days</p>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
                <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-lg font-bold">Order List</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search order report"
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64"
                            />
                        </div>
                        <button className="p-2 rounded-lg border hover:bg-background-soft text-text-muted">
                            <Filter size={18} />
                        </button>
                        <button className="p-2 rounded-lg border hover:bg-background-soft text-text-muted">
                            <ArrowUpDown size={18} />
                        </button>
                        <button className="p-2 rounded-lg border hover:bg-background-soft text-text-muted">
                            <MoreVertical size={18} />
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4 flex items-center gap-1 bg-background-soft/30 border-b border-border-custom">
                    {["All order", "Completed", "Pending", "Canceled"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
                                activeTab === tab ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-foreground"
                            )}
                        >
                            {tab === "All order" ? "All order (240)" : tab}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-primary/5 text-xs font-bold text-primary uppercase tracking-wider border-b border-border-custom">
                                <th className="px-6 py-4">No.</th>
                                <th className="px-6 py-4">Order Id</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom text-sm">
                            {orders.map((order, i) => (
                                <tr key={order.id} className="hover:bg-background-soft/50 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <input type="checkbox" className="rounded accent-primary" />
                                        <span className="text-text-muted font-medium">{i + 1}</span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold">{order.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-background-soft overflow-hidden border">
                                                <img src={order.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-medium">{order.product}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted">{order.date}</td>
                                    <td className="px-6 py-4 font-bold">{order.price}</td>
                                    <td className="px-6 py-4 text-text-muted items-center gap-2 flex">
                                        <span className={cn(
                                            "w-2 h-2 rounded-full",
                                            order.payment === "Paid" ? "bg-primary" : "bg-warning"
                                        )}></span>
                                        {order.payment}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold border",
                                            statusStyles[order.status]
                                        )}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-border-custom flex items-center justify-between">
                    <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-background-soft transition-all flex items-center gap-2">
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5, "...", 24].map((n, i) => (
                            <button
                                key={i}
                                className={cn(
                                    "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all",
                                    n === 1 ? "bg-primary-light text-primary" : "text-text-muted hover:bg-background-soft"
                                )}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-background-soft transition-all flex items-center gap-2">
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}
