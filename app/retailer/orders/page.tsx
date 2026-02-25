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
    Plus,
    CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
    { title: "Total Shop Orders", value: "85", change: "+5.4%", trend: "up", color: "bg-primary-light text-primary" },
    { title: "Pending Orders", value: "12", change: "+2", trend: "up", color: "bg-warning-50 text-warning" },
    { title: "Completed", value: "68", change: "80%", trend: "up", color: "bg-green-50 text-green-600" },
    { title: "Avg. Order Value", value: "$42.50", change: "+2.1%", trend: "up", color: "bg-blue-50 text-blue-600" },
]

const orders = [
    { id: "#SHP-1001", product: "2kg Whiteleg Shrimp", date: "25-02-2026", price: "48.00", payment: "Paid", status: "New" },
    { id: "#SHP-1002", product: "1kg Premium Tiger Shrimp", date: "25-02-2026", price: "32.50", payment: "Unpaid", status: "Pending" },
    { id: "#SHP-1003", product: "500g Peeled & Deveined", date: "24-02-2026", price: "18.99", payment: "Paid", status: "Shipped" },
]

const statusStyles: any = {
    "New": "bg-primary-light text-primary border-primary-100",
    "Pending": "bg-warning-50 text-warning border-warning-100",
    "Shipped": "bg-blue-50 text-blue-600 border-blue-100",
    "Delivered": "bg-green-50 text-green-600 border-green-100",
}

export default function RetailerOrdersPage() {
    const [activeTab, setActiveTab] = useState("All Orders")

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Shop Orders</h1>
                    <p className="text-text-muted">Manage and fulfill your customer orders.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary transition-all text-sm font-medium shadow-md shadow-primary/20">
                        <Download size={16} />
                        Export List
                    </button>
                    <button className="p-2 rounded-lg border bg-white hover:bg-background-soft">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{stat.title}</p>
                            <div className={cn("w-2 h-2 rounded-full", stat.trend === "up" ? "bg-primary" : "bg-red-500")}></div>
                        </div>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                            <span className={cn("text-xs font-bold", stat.trend === "up" ? "text-primary" : "text-red-500")}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-lg font-bold">Recent Orders</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-primary/5 text-xs font-bold text-primary uppercase tracking-wider border-b border-border-custom">
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Product Details</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom text-sm">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-background-soft/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-primary">{order.id}</td>
                                    <td className="px-6 py-4 font-medium">{order.product}</td>
                                    <td className="px-6 py-4 text-text-muted">{order.date}</td>
                                    <td className="px-6 py-4 font-bold">{order.price}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "flex items-center gap-1.5 font-semibold",
                                            order.payment === "Paid" ? "text-primary" : "text-warning"
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", order.payment === "Paid" ? "bg-primary" : "bg-warning")}></div>
                                            {order.payment}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[11px] font-black uppercase border",
                                            statusStyles[order.status]
                                        )}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-2 hover:bg-primary-light text-text-muted hover:text-primary rounded-lg transition-colors">
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-green-50 text-text-muted hover:text-green-600 rounded-lg transition-colors">
                                                <CheckCircle size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
