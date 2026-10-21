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
    Globe,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
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
    { title: "Total Customers", value: "11,040", change: "+14.4%", trend: "up", icon: Users, color: "bg-primary-light text-primary" },
    { title: "New Customers", value: "2,370", change: "+20%", trend: "up", icon: UserPlus, color: "bg-blue-50 text-blue-600" },
    { title: "Visitor", value: "250k", change: "+20%", trend: "up", icon: Globe, color: "bg-purple-50 text-purple-600" },
]

const chartData = [
    { name: "Sun", customers: 20 },
    { name: "Mon", customers: 35 },
    { name: "Tue", customers: 30 },
    { name: "Wed", customers: 45 },
    { name: "Thu", customers: 40 },
    { name: "Fri", customers: 55 },
    { name: "Sat", customers: 50 },
]

const customers = [
    { id: "#CUST001", name: "John Doe", email: "john.doe@example.com", phone: "+1234567890", orderCount: 25, spend: "3,450.00", status: "Active", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
    { id: "#CUST002", name: "Jane Smith", email: "jane.smith@example.com", phone: "+1234567890", orderCount: 5, spend: "250.00", status: "Inactive", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane" },
    { id: "#CUST003", name: "Emily Davis", email: "emily.davis@example.com", phone: "+1234567890", orderCount: 30, spend: "4,600.00", status: "VIP", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" },
    { id: "#CUST004", name: "Michael Brown", email: "michael@example.com", phone: "+1234567890", orderCount: 15, spend: "1,200.00", status: "Active", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
]

export default function CustomersPage() {
    const [selectedCustomer, setSelectedCustomer] = useState(customers[0])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold tracking-tight">Customers</h1>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-background-soft p-0.5 rounded-lg text-xs font-bold">
                        <button className="px-3 py-1 bg-white shadow-sm rounded-md">This week</button>
                        <button className="px-3 py-1 text-text-muted hover:text-foreground">Last week</button>
                    </div>
                    <button className="p-1.5 rounded-lg border bg-white hover:bg-background-soft">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                <div className="lg:col-span-1 space-y-2.5">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-3 rounded-xl border border-border-custom shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold text-text-muted mb-0.5">{stat.title}</p>
                                <div className="flex items-end gap-2">
                                    <h3 className="text-xl font-bold leading-none">{stat.value}</h3>
                                    <span className="text-[10px] font-bold text-primary flex items-center">
                                        <TrendingUp size={11} className="mr-0.5" />
                                        {stat.change}
                                    </span>
                                </div>
                                <p className="text-[9px] text-text-muted mt-0.5">Last 7 days</p>
                            </div>
                            <div className={cn("p-2 rounded-lg", stat.color)}>
                                <stat.icon size={18} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-2 bg-white p-3.5 rounded-xl border border-border-custom shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold">Customer Overview</h3>
                        <div className="flex items-center gap-3 text-[10px] font-bold">
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-1 bg-primary rounded-full"></div>
                                <span>Active Customers</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-1 bg-primary-light rounded-full"></div>
                                <span>New Customers</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[150px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCust" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#AEDC81" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#AEDC81" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: "#868889" }}
                                    dy={5}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#868889" }} />
                                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 10px rgba(0,0,0,0.08)", fontSize: "11px" }} />
                                <Area
                                    type="monotone"
                                    dataKey="customers"
                                    stroke="#6CC51D"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorCust)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3.5">
                <div className="lg:col-span-3 bg-white rounded-xl border border-border-custom shadow-sm overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="p-3 border-b border-border-custom flex items-center justify-between">
                            <h3 className="text-xs font-bold">Customer Details</h3>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" size={13} />
                                    <input
                                        type="text"
                                        placeholder="Search customer"
                                        className="pl-7 pr-3 py-1 rounded-lg bg-background-soft border-transparent text-xs outline-none w-44"
                                    />
                                </div>
                                <button className="p-1 rounded-lg border hover:bg-background-soft text-text-muted">
                                    <Filter size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-primary/5 text-[10px] font-bold text-primary uppercase tracking-wider">
                                        <th className="px-3.5 py-2">Customer Id</th>
                                        <th className="px-3.5 py-2">Name</th>
                                        <th className="px-3.5 py-2">Phone</th>
                                        <th className="px-3.5 py-2">Order Count</th>
                                        <th className="px-3.5 py-2">Total Spend</th>
                                        <th className="px-3.5 py-2">Status</th>
                                        <th className="px-3.5 py-2 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-xs">
                                    {customers.map((c) => (
                                        <tr
                                            key={c.id}
                                            onClick={() => setSelectedCustomer(c)}
                                            className={cn(
                                                "hover:bg-background-soft transition-colors cursor-pointer",
                                                selectedCustomer?.id === c.id && "bg-background-soft/50"
                                            )}
                                        >
                                            <td className="px-3.5 py-2 font-semibold text-gray-700">{c.id}</td>
                                            <td className="px-3.5 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full overflow-hidden border">
                                                        <img src={c.image} alt="" />
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{c.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-3.5 py-2 text-text-muted">{c.phone}</td>
                                            <td className="px-3.5 py-2 font-bold">{c.orderCount}</td>
                                            <td className="px-3.5 py-2 font-bold text-primary">{c.spend}</td>
                                            <td className="px-3.5 py-2">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 w-fit",
                                                    c.status === "Active" ? "bg-primary-light text-primary" :
                                                        c.status === "VIP" ? "bg-warning-50 text-warning" : "bg-red-50 text-red-500"
                                                )}>
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        c.status === "Active" ? "bg-primary" :
                                                            c.status === "VIP" ? "bg-warning" : "bg-red-500"
                                                    )}></div>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-3.5 py-2">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button className="p-1 rounded-md hover:bg-primary-light text-text-muted hover:text-primary">
                                                        <MessageSquare size={13} />
                                                    </button>
                                                    <button className="p-1 rounded-md hover:bg-red-50 text-text-muted hover:text-red-500">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="p-3 border-t flex items-center justify-between">
                        <button className="px-3 py-1 border rounded-lg text-xs font-medium hover:bg-background-soft transition-all flex items-center gap-1.5">
                            <ChevronLeft size={13} /> Previous
                        </button>
                        <div className="flex items-center gap-1">
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold bg-primary-light text-primary">1</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold text-text-muted hover:bg-background-soft">2</button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold text-text-muted hover:bg-background-soft">3</button>
                        </div>
                        <button className="px-3 py-1 border rounded-lg text-xs font-medium hover:bg-background-soft transition-all flex items-center gap-1.5">
                            Next <ChevronRight size={13} />
                        </button>
                    </div>
                </div>

                {/* Customer Profile Card */}
                <div className="bg-white rounded-xl border border-border-custom shadow-sm p-3.5 space-y-3.5">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full border-2 border-primary-light bg-background-soft overflow-hidden mx-auto mb-2">
                            <img src={selectedCustomer?.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center justify-center gap-1.5 mb-0.5">
                            <h3 className="text-base font-bold text-gray-900 leading-tight">{selectedCustomer?.name}</h3>
                            <button className="text-primary hover:scale-105 transition-transform">
                                <ExternalLink size={13} />
                            </button>
                        </div>
                        <p className="text-xs font-medium text-text-muted">{selectedCustomer?.email}</p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Customer Info</p>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-background-soft">
                                <Phone size={14} className="text-text-muted" />
                                <p className="text-xs font-bold">{selectedCustomer?.phone}</p>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-background-soft">
                                <MapPin size={14} className="text-text-muted" />
                                <p className="text-xs font-bold line-clamp-1">123 Main St, NY</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Social Media</p>
                        <div className="flex items-center justify-between">
                            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                                <button key={i} className="w-7 h-7 rounded-full border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-all">
                                    <Icon size={13} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Activity</p>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-text-muted">Registration:</span>
                                <span className="font-bold">15.01.2025</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-text-muted">Last purchase:</span>
                                <span className="font-bold">10.01.2025</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2.5 border-t">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Order overview</p>
                        <div className="grid grid-cols-3 gap-1.5">
                            <div className="bg-background-soft py-2 rounded-lg text-center">
                                <p className="text-base font-bold text-gray-900">{selectedCustomer?.orderCount}</p>
                                <p className="text-[9px] text-text-muted font-bold">Total</p>
                            </div>
                            <div className="bg-background-soft py-2 rounded-lg text-center">
                                <p className="text-base font-bold text-gray-900">140</p>
                                <p className="text-[9px] text-text-muted font-bold">Completed</p>
                            </div>
                            <div className="bg-background-soft py-2 rounded-lg text-center">
                                <p className="text-base font-bold text-gray-900">10</p>
                                <p className="text-[9px] text-text-muted font-bold">Canceled</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
