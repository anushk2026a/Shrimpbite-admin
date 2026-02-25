"use client"

import { useState } from "react"
import { Search, Filter, Plus, MoreVertical, User, Mail, Shield, UserCheck, UserX } from "lucide-react"
import { cn } from "@/lib/utils"

const retailers = [
    { id: "RET001", name: "Rajesh Kumar", email: "rajesh@coastaharvest.com", shop: "Coastal Harvest", joined: "12-01-2026", status: "Verified" },
    { id: "RET002", name: "Anita Singh", email: "anita@deepsea.com", shop: "Deep Sea Delights", joined: "05-02-2026", status: "Unverified" },
    { id: "RET003", name: "Samuel John", email: "sam@freshcatch.in", shop: "Fresh Catch Co.", joined: "20-02-2026", status: "Verified" },
]

export default function RetailersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Retailer Accounts</h1>
                    <p className="text-text-muted">Manage retailer users and their platform permissions.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium">
                    <Plus size={16} /> Add Retailer
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
                <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-lg font-bold">Platform Retailers</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search retailers..."
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-primary/5 text-xs font-bold text-primary uppercase tracking-wider border-b border-border-custom">
                                <th className="px-6 py-4">Retailer ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Shop Assignment</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom text-sm">
                            {retailers.map((ret) => (
                                <tr key={ret.id} className="hover:bg-background-soft/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold">{ret.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{ret.name}</span>
                                            <span className="text-xs text-text-muted">{ret.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-lg bg-background-soft text-text-muted font-medium border border-border-custom">
                                            {ret.shop}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted">{ret.joined}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold border",
                                            ret.status === "Verified" ? "bg-green-50 text-green-600 border-green-100" : "bg-warning-50 text-warning border-warning-100"
                                        )}>
                                            {ret.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-2 hover:bg-green-50 text-green-600 rounded-lg" title="Verify User">
                                                <UserCheck size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg" title="Suspend User">
                                                <UserX size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-background-soft text-text-muted rounded-lg">
                                                <MoreVertical size={18} />
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
