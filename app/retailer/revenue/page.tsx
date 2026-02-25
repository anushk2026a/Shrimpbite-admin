"use client"

import { useState } from "react"
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, Download, MoreVertical } from "lucide-react"
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

const data = [
    { name: "Mon", revenue: 4500, previous: 3800 },
    { name: "Tue", revenue: 5200, previous: 4100 },
    { name: "Wed", revenue: 4800, previous: 4400 },
    { name: "Thu", revenue: 6100, previous: 5000 },
    { name: "Fri", revenue: 5900, previous: 5200 },
    { name: "Sat", revenue: 7200, previous: 6000 },
    { name: "Sun", revenue: 6800, previous: 5800 },
]

export default function RetailerRevenuePage() {
    const [activeInterval, setActiveInterval] = useState("Weekly")

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Revenue Intelligence</h1>
                    <p className="text-text-muted">In-depth analysis of your shop's financial health.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-background-soft p-1 rounded-lg flex items-center gap-1">
                        {["Daily", "Weekly", "Monthly"].map(interval => (
                            <button
                                key={interval}
                                onClick={() => setActiveInterval(interval)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                                    activeInterval === interval ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-foreground"
                                )}
                            >
                                {interval}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary transition-all text-sm font-medium shadow-md shadow-primary/20">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Net Revenue", value: "$42,850.00", change: "+12.5%", color: "text-primary", bg: "bg-primary-light" },
                    { label: "Total Tax", value: "$2,450.00", change: "+2.1%", color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Shipping Fees", value: "$1,200.00", change: "+5.4%", color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Discounts", value: "$850.00", change: "-1.5%", color: "text-red-500", bg: "bg-red-50" },
                ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">{item.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-bold">{item.value}</h3>
                            <span className={cn("text-[10px] font-black px-2 py-1 rounded-md", item.bg, item.color)}>
                                {item.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border-custom shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold">Revenue Trends</h3>
                            <p className="text-sm text-text-muted">Comparing current vs previous period</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary"></div>
                                <span className="text-xs font-bold text-text-muted">Current</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                <span className="text-xs font-bold text-text-muted">Previous</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#868889" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#868889" }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="previous" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="revenue" fill="#6CC51D" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm space-y-6">
                    <h3 className="text-lg font-bold">Payout Details</h3>
                    <div className="space-y-4">
                        {[
                            { date: "Feb 24, 2026", amount: "$8,200.00", status: "Processed" },
                            { date: "Feb 17, 2026", amount: "$7,150.00", status: "Processed" },
                            { date: "Feb 10, 2026", amount: "$6,900.00", status: "Processed" },
                            { date: "Feb 03, 2026", amount: "$9,400.00", status: "Processed" },
                        ].map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-background-soft/50 border border-transparent hover:border-primary/10 transition-all">
                                <div>
                                    <p className="text-sm font-bold">{p.amount}</p>
                                    <p className="text-[10px] text-text-muted font-bold uppercase">{p.date}</p>
                                </div>
                                <span className="px-2 py-1 bg-primary-light text-primary text-[10px] font-black rounded-md uppercase">
                                    {p.status}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-3 rounded-xl border-2 border-dashed border-border-custom text-sm font-bold text-text-muted hover:text-primary hover:border-primary transition-all">
                        View All Settlements
                    </button>
                </div>
            </div>
        </div>
    )
}
