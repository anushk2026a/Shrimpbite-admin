"use client"

import { useState } from "react"
import {
    ChevronRight,
    Search,
    Filter,
    MoreHorizontal,
    Plus,
    Eye,
    Edit2,
    Trash2,
    ArrowUpDown
} from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
    { id: 1, name: "Fresh White Shrimp", items: 45, icon: "🍤" },
    { id: 2, name: "Premium Tiger", items: 12, icon: "🐅" },
    { id: 3, name: "Peeled & Ready", items: 28, icon: "🥣" },
    { id: 4, name: "Ready to Eat", items: 15, icon: "🍽️" },
    { id: 5, name: "Whole Sea Fish", items: 32, icon: "🐟" },
    { id: 6, name: "Frozen Stock", items: 50, icon: "❄️" },
    { id: 7, name: "Process & Cook", items: 18, icon: "👨‍🍳" },
    { id: 8, name: "Special Offers", items: 8, icon: "🔥" },
]

const products = [
    { id: 1, name: "Whiteleg Shrimp (40/50)", image: "https://images.unsplash.com/photo-1559742811-822873691df8?q=80&w=100&h=100&auto=format&fit=crop", created: "24-02-2026", order: 125 },
    { id: 2, name: "Black Tiger Shrimp (U-15)", image: "https://images.unsplash.com/photo-1515141982883-c7ad0e69fd62?q=80&w=100&h=100&auto=format&fit=crop", created: "24-02-2026", order: 84 },
    { id: 3, name: "Peeled & Deveined (Tail-off)", image: "https://images.unsplash.com/photo-1582982200325-188b3f2be666?q=80&w=100&h=100&auto=format&fit=crop", created: "25-02-2026", order: 210 },
    { id: 4, name: "Atlantic Mackerel Whole", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?q=80&w=100&h=100&auto=format&fit=crop", created: "25-02-2026", order: 45 },
    { id: 5, name: "Marinated Squid Rings", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=100&h=100&auto=format&fit=crop", created: "25-02-2026", order: 62 },
]

export default function CategoriesPage() {
    const [activeTab, setActiveTab] = useState("All Product")

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-all text-sm font-medium">
                        <Plus size={16} />
                        Add Product
                    </button>
                    <button className="p-2 rounded-lg border bg-white hover:bg-background-soft text-text-muted">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* Discover Categories Grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Discover</h2>
                    <button className="p-1.5 rounded-full border bg-white shadow-sm hover:shadow-md transition-all">
                        <ChevronRight size={18} />
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-white p-4 rounded-xl border border-border-custom flex items-center gap-4 hover:shadow-sm transition-all cursor-pointer group">
                            <div className="w-12 h-12 rounded-lg bg-background-soft flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                {cat.icon}
                            </div>
                            <div>
                                <p className="font-bold text-sm">{cat.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Product List Section */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1 bg-background-soft p-1 rounded-lg">
                        {["All Product", "Featured Products", "On Sale", "Out of Stock"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
                                    activeTab === tab ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-foreground"
                                )}
                            >
                                {tab === "All Product" ? "All Product (145)" : tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search your product"
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64"
                            />
                        </div>
                        <button className="p-2 rounded-lg border hover:bg-background-soft text-text-muted">
                            <Filter size={18} />
                        </button>
                        <button className="p-2 rounded-lg border hover:bg-background-soft text-text-muted">
                            <Plus size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-primary/5 text-xs font-bold text-primary-dark uppercase tracking-wider">
                                <th className="px-6 py-4">No.</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Created Date</th>
                                <th className="px-6 py-4 flex items-center gap-1">Order <ArrowUpDown size={12} /></th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom text-sm">
                            {products.map((p, i) => (
                                <tr key={p.id} className="hover:bg-background-soft/50 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <input type="checkbox" className="rounded accent-primary" />
                                        <span className="text-text-muted font-medium">{i + 1}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden border">
                                                <img src={p.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-semibold">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted font-medium">{p.created}</td>
                                    <td className="px-6 py-4 font-bold">{p.order}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-2 rounded-lg hover:bg-primary-light text-text-muted hover:text-primary-dark transition-all">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="p-6 border-t flex items-center justify-between">
                    <button className="px-4 py-2 border border-border-custom rounded-lg text-sm font-medium hover:bg-background-soft transition-all flex items-center gap-2">
                        Previous
                    </button>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5, "...", 24].map((n, i) => (
                            <button
                                key={i}
                                className={cn(
                                    "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all",
                                    n === 1 ? "bg-primary-light text-primary-dark" : "text-text-muted hover:bg-background-soft"
                                )}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    <button className="px-4 py-2 border border-border-custom rounded-lg text-sm font-medium hover:bg-background-soft transition-all flex items-center gap-2">
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}
