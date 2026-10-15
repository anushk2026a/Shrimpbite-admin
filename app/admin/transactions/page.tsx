"use client"

import { useState, useEffect } from "react"
import { Search, Download, ArrowUpRight, ArrowDownRight, DollarSign, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import apiClient from "@/data/api/apiClient"

interface Transaction {
    _id: string
    user: string
    email: string
    phone: string
    amount: number
    type: "Credit" | "Debit"
    status: "Pending" | "Success" | "Failed"
    description: string
    referenceId: string
    source: string
    date: string
}

interface Stats {
    totalVolume: number
    totalCredits: number
    totalDebits: number
    pendingCount: number
}

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [stats, setStats] = useState<Stats>({ totalVolume: 0, totalCredits: 0, totalDebits: 0, pendingCount: 0 })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterType, setFilterType] = useState("")
    const [filterStatus, setFilterStatus] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const fetchTransactions = async () => {
        setLoading(true)
        try {
            const params: any = { page, limit: 50 }
            if (search) params.search = search
            if (filterType) params.type = filterType
            if (filterStatus) params.status = filterStatus

            const res = await apiClient.get("/admin/transactions", { params })
            const data = res.data?.data
            if (data) {
                setTransactions(data.transactions || [])
                setStats(data.stats || { totalVolume: 0, totalCredits: 0, totalDebits: 0, pendingCount: 0 })
                setTotalPages(data.pagination?.pages || 1)
            }
        } catch (error) {
            console.error("Failed to fetch transactions:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTransactions()
    }, [page, filterType, filterStatus])

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1)
            fetchTransactions()
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    const formatCurrency = (amt: number) => `₹${amt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Transactions</h1>
                    <p className="text-text-muted">Track all customer wallet credits, debits, and payment activity.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary-light text-primary"><DollarSign size={22} /></div>
                    <div>
                        <p className="text-xs font-semibold text-text-muted uppercase">Total Volume</p>
                        <h3 className="text-xl font-bold">{formatCurrency(stats.totalVolume)}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600"><ArrowUpRight size={22} /></div>
                    <div>
                        <p className="text-xs font-semibold text-text-muted uppercase">Total Credits</p>
                        <h3 className="text-xl font-bold">{formatCurrency(stats.totalCredits)}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-red-50 text-red-600"><ArrowDownRight size={22} /></div>
                    <div>
                        <p className="text-xs font-semibold text-text-muted uppercase">Total Debits</p>
                        <h3 className="text-xl font-bold">{formatCurrency(stats.totalDebits)}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-orange-50 text-orange-600"><Clock size={22} /></div>
                    <div>
                        <p className="text-xs font-semibold text-text-muted uppercase">Pending</p>
                        <h3 className="text-xl font-bold">{stats.pendingCount}</h3>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <h3 className="text-lg font-bold">Transaction History</h3>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email or ref..."
                                className="pl-9 pr-4 py-2 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
                            className="px-3 py-2 rounded-lg bg-background-soft text-sm outline-none border-transparent"
                        >
                            <option value="">All Types</option>
                            <option value="Credit">Credit</option>
                            <option value="Debit">Debit</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
                            className="px-3 py-2 rounded-lg bg-background-soft text-sm outline-none border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="Success">Success</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="p-16 flex justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-16 text-center text-text-muted">
                        <p className="text-lg font-medium">No transactions found.</p>
                        <p className="text-sm mt-1">User wallet transactions will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-primary/5 text-xs font-bold text-primary uppercase">
                                <tr>
                                    <th className="px-5 py-4">User</th>
                                    <th className="px-5 py-4">Description</th>
                                    <th className="px-5 py-4">Amount</th>
                                    <th className="px-5 py-4 text-center">Type</th>
                                    <th className="px-5 py-4">Source</th>
                                    <th className="px-5 py-4">Date</th>
                                    <th className="px-5 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-custom text-sm">
                                {transactions.map((txn) => (
                                    <tr key={txn._id} className="hover:bg-background-soft transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-900">{txn.user}</p>
                                            <p className="text-xs text-text-muted">{txn.phone || txn.email}</p>
                                        </td>
                                        <td className="px-5 py-4 text-text-muted max-w-[200px] truncate">{txn.description}</td>
                                        <td className="px-5 py-4 font-bold">{formatCurrency(txn.amount)}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest",
                                                txn.type === "Credit" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"
                                            )}>
                                                {txn.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-text-muted text-xs font-medium">{txn.source}</td>
                                        <td className="px-5 py-4 text-text-muted">{formatDate(txn.date)}</td>
                                        <td className="px-5 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest",
                                                txn.status === "Success" ? "bg-green-50 text-green-600 border-green-100" :
                                                txn.status === "Pending" ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                "bg-red-50 text-red-600 border-red-100"
                                            )}>
                                                {txn.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border-custom flex items-center justify-between">
                        <p className="text-sm text-text-muted">Page {page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-background-soft"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-background-soft"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
