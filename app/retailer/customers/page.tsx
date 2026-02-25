"use client"

import { useState } from "react"
import {
    Users,
    UserPlus,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    MessageSquare,
    Trash2,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    ExternalLink
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
import { cn } from "@/lib/utils"

const stats = [
    { title: "My Total Customers", value: "842", change: "+5.4%", trend: "up", icon: Users, color: "bg-primary-light text-primary" },
    { title: "New Customers", value: "12", change: "+2%", trend: "up", icon: UserPlus, color: "bg-blue-50 text-blue-600" },
    { title: "Repeat Customers", value: "65%", change: "+4%", trend: "up", icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
]

const chartData = [
    { name: "Mon", customers: 4 },
    { name: "Tue", customers: 7 },
    { name: "Wed", customers: 5 },
    { name: "Thu", customers: 9 },
    { name: "Fri", customers: 12 },
    { name: "Sat", customers: 8 },
    { name: "Sun", customers: 10 },
]

const myCustomers = [
    { id: "#C-1001", name: "Anil Sharma", email: "anil@example.com", phone: "+91 9876543210", orderCount: 4, spend: "1,240.00", status: "Active", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anil" },
    { id: "#C-1002", name: "Priya Roy", email: "priya@example.com", phone: "+91 9876543211", orderCount: 1, spend: "450.00", status: "Active", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
    { id: "#C-1003", name: "Kevin Varkey", email: "kevin@example.com", phone: "+91 9876543212", orderCount: 12, spend: "4,200.00", status: "VIP", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin" },
]

export default function RetailerCustomersPage() {
    const [selectedCustomer, setSelectedCustomer] = useState(myCustomers[0])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Customers</h1>
                    <p className="text-text-muted">Manage your shop's customer base and loyalty.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg border bg-white hover:bg-background-soft">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                            <div>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">{stat.title}</p>
                                <div className="flex items-end gap-2">
                                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                                    <span className="text-xs font-bold text-primary flex items-center mb-1">
                                        {stat.change}
                                    </span>
                                </div>
                            </div>
                            <div className={cn("p-3 rounded-xl", stat.color)}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border-custom shadow-sm overflow-hidden min-h-[300px]">
                    <h3 className="text-lg font-bold mb-6">Customer Growth</h3>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6CC51D" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6CC51D" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#868889" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#868889" }} />
                                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                                <Area type="monotone" dataKey="customers" stroke="#6CC51D" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border-custom flex items-center justify-between">
                        <h3 className="text-lg font-bold">Customer Directory</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search my customers"
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-primary/5 text-xs font-bold text-primary uppercase">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Orders</th>
                                    <th className="px-6 py-4">Spent</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {myCustomers.map((c) => (
                                    <tr key={c.id} onClick={() => setSelectedCustomer(c)} className={cn("hover:bg-background-soft cursor-pointer", selectedCustomer?.id === c.id && "bg-background-soft/50")}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full overflow-hidden border">
                                                    <img src={c.image} alt="" />
                                                </div>
                                                <span className="font-bold">{c.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold">{c.orderCount}</td>
                                        <td className="px-6 py-4 font-bold">${c.spend}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit",
                                                c.status === "Active" ? "bg-primary-light text-primary" : "bg-warning-50 text-warning"
                                            )}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="p-2 hover:bg-primary-light hover:text-primary rounded-lg">
                                                <MessageSquare size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-primary-light overflow-hidden mx-auto mb-3">
                            <img src={selectedCustomer?.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-bold">{selectedCustomer?.name}</h3>
                        <p className="text-xs text-text-muted">{selectedCustomer?.email}</p>
                    </div>
                    <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                            <Phone size={14} className="text-text-muted" />
                            <span className="font-medium">{selectedCustomer?.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin size={14} className="text-text-muted" />
                            <span className="font-medium">Kochi, Kerala</span>
                        </div>
                    </div>
                    <button className="w-full py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm">
                        View Purchase History
                    </button>
                </div>
            </div>
        </div>
    )
}
