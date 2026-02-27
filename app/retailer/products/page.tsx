"use client"

import { useState } from "react"
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Package,
    TrendingUp,
    AlertCircle
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const products = [
    { id: 1, name: "Premium Whiteleg Shrimp (40/50)", category: "Fresh Shrimp", price: "24.99", stock: 145, status: "In Stock", image: "https://images.unsplash.com/photo-1559742811-822873691df8?q=80&w=100&h=100&auto=format&fit=crop" },
    { id: 2, name: "Giant Tiger Shrimp (U-10)", category: "Premium Seafood", price: "45.00", stock: 12, status: "Low Stock", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80" },
    { id: 3, name: "Peeled & Deveined (Tail-on)", category: "Ready to Cook", price: "19.99", stock: 85, status: "In Stock", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80" },
]

export default function RetailerProductsPage() {
    const [activeTab, setActiveTab] = useState("All Products")

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Products</h1>
                    <p className="text-text-muted">Manage your shop's inventory and listings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/retailer/products/add" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary transition-all text-sm font-medium shadow-md shadow-primary/20">
                        <Plus size={16} />
                        Add New Item
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary-light text-primary">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">My Products</p>
                        <h3 className="text-2xl font-bold">24</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Active Listings</p>
                        <h3 className="text-2xl font-bold">22</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-red-50 text-red-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Low Stock</p>
                        <h3 className="text-2xl font-bold">3</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-300 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1 bg-background-soft p-1 rounded-lg">
                        {["All Products", "Published", "Draft"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
                                    activeTab === tab ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search my inventory"
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-primary/5 text-xs font-bold text-primary uppercase tracking-wider border-b border-gray-300">
                                <th className="px-6 py-4">No.</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-300 text-sm">
                            {products.map((p, i) => (
                                <tr key={p.id} className="hover:bg-background-soft/50 transition-colors">
                                    <td className="px-6 py-4">
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
                                    <td className="px-6 py-4 text-text-muted font-medium">{p.category}</td>
                                    <td className="px-6 py-4 font-bold">${p.price}</td>
                                    <td className="px-6 py-4 font-bold">{p.stock}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit",
                                            p.status === "In Stock" ? "bg-primary-light text-primary" : "bg-warning-50 text-warning"
                                        )}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-2 rounded-lg hover:bg-primary-light text-text-muted hover:text-primary transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-gray-300 flex items-center justify-between">
                    <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-background-soft transition-all flex items-center gap-2">
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <div className="flex items-center gap-1">
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold bg-primary-light text-primary">1</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold text-text-muted hover:bg-background-soft">2</button>
                    </div>
                    <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-background-soft transition-all flex items-center gap-2">
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}
