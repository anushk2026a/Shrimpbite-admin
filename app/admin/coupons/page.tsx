"use client"

import { useState, useEffect } from "react"
import {
    Ticket,
    Plus,
    Search,
    Trash2,
    Calendar,
    Users,
    TrendingUp,
    CheckCircle,
    XCircle,
    Copy,
    Check,
    Percent,
    Tag,
    Clock,
    DollarSign
} from "lucide-react"
import { cn } from "@/lib/utils"
import apiClient from "@/data/api/apiClient"

interface Coupon {
    _id: string
    code: string
    title: string
    description?: string
    discountType: "percentage" | "flat"
    discountValue: number
    minOrderValue: number
    maxDiscountAmount?: number | null
    validFrom: string
    validUntil: string
    usageLimit: number
    usageCount: number
    userUsageLimit: number
    isActive: boolean
    retailer?: {
        name: string
        businessDetails?: {
            shopName?: string
        }
    } | null
    createdAt: string
}

interface CouponStats {
    totalCampaigns: number
    activeCoupons: number
    totalRedemptions: number
    totalSubsidized: number
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [stats, setStats] = useState<CouponStats>({
        totalCampaigns: 0,
        activeCoupons: 0,
        totalRedemptions: 0,
        totalSubsidized: 0
    })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [showModal, setShowModal] = useState(false)
    const [copiedCode, setCopiedCode] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        code: "",
        title: "",
        description: "",
        discountType: "percentage" as "percentage" | "flat",
        discountValue: "",
        minOrderValue: "",
        maxDiscountAmount: "",
        validUntil: "",
        usageLimit: "100",
        userUsageLimit: "1"
    })
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState("")

    const fetchCoupons = async () => {
        setLoading(true)
        try {
            const res = await apiClient.get("/coupons/admin")
            if (res.data?.success) {
                setCoupons(res.data.data.coupons || [])
                setStats(res.data.data.stats || {
                    totalCampaigns: 0,
                    activeCoupons: 0,
                    totalRedemptions: 0,
                    totalSubsidized: 0
                })
            }
        } catch (error) {
            console.error("Failed to fetch coupons:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCoupons()
    }, [])

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000)
    }

    const toggleStatus = async (coupon: Coupon) => {
        try {
            await apiClient.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive })
            setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
        } catch (error) {
            console.error("Failed to toggle coupon status:", error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return
        try {
            await apiClient.delete(`/coupons/${id}`)
            setCoupons(prev => prev.filter(c => c._id !== id))
        } catch (error) {
            console.error("Failed to delete coupon:", error)
        }
    }

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")

        if (!formData.code || !formData.title || !formData.discountValue || !formData.validUntil) {
            setFormError("Please fill in all required fields (Code, Title, Discount, and Expiry).")
            return
        }

        setSubmitting(true)
        try {
            const payload = {
                code: formData.code.trim().toUpperCase(),
                title: formData.title.trim(),
                description: formData.description.trim(),
                discountType: formData.discountType,
                discountValue: Number(formData.discountValue),
                minOrderValue: Number(formData.minOrderValue) || 0,
                maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
                validUntil: new Date(formData.validUntil).toISOString(),
                usageLimit: Number(formData.usageLimit) || 100,
                userUsageLimit: Number(formData.userUsageLimit) || 1
            }

            const res = await apiClient.post("/coupons", payload)
            if (res.data?.success) {
                setShowModal(false)
                setFormData({
                    code: "",
                    title: "",
                    description: "",
                    discountType: "percentage",
                    discountValue: "",
                    minOrderValue: "",
                    maxDiscountAmount: "",
                    validUntil: "",
                    usageLimit: "100",
                    userUsageLimit: "1"
                })
                fetchCoupons()
            }
        } catch (error: any) {
            setFormError(error?.response?.data?.message || error.message || "Failed to create coupon")
        } finally {
            setSubmitting(false)
        }
    }

    const filteredCoupons = coupons.filter(c => {
        const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase()) ||
            c.title.toLowerCase().includes(search.toLowerCase())
        if (!matchesSearch) return false

        const isExpired = new Date(c.validUntil) < new Date()
        if (statusFilter === "active") return c.isActive && !isExpired
        if (statusFilter === "inactive") return !c.isActive
        if (statusFilter === "expired") return isExpired
        return true
    })

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">Coupons & Special Offers</h1>
                    <p className="text-xs text-text-muted mt-0.5">
                        Create and manage promotional campaigns, festival offers, and discount codes.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition shadow-sm"
                >
                    <Plus size={15} /> Create New Offer
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-xl border border-border-custom shadow-sm flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Ticket size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-text-muted uppercase">Total Campaigns</p>
                        <h3 className="text-lg font-bold text-gray-900 leading-none mt-0.5">{stats.totalCampaigns}</h3>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-border-custom shadow-sm flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                        <CheckCircle size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-text-muted uppercase">Active Offers</p>
                        <h3 className="text-lg font-bold text-emerald-600 leading-none mt-0.5">{stats.activeCoupons}</h3>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-border-custom shadow-sm flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-text-muted uppercase">Total Redemptions</p>
                        <h3 className="text-lg font-bold text-blue-600 leading-none mt-0.5">{stats.totalRedemptions}</h3>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-border-custom shadow-sm flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                        <DollarSign size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-text-muted uppercase">Subsidized Savings</p>
                        <h3 className="text-lg font-bold text-purple-600 leading-none mt-0.5">₹{stats.totalSubsidized.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Table & Controls */}
            <div className="bg-white rounded-xl border border-border-custom shadow-sm overflow-hidden">
                <div className="p-3 border-b border-border-custom flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search coupon by code or title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1 bg-background-soft rounded-lg text-xs border-transparent focus:bg-white focus:ring-1 focus:ring-primary/30 outline-none transition"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-2.5 py-1 bg-background-soft rounded-lg text-xs border-transparent outline-none focus:bg-white focus:ring-1 focus:ring-primary/30"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Offers</option>
                            <option value="inactive">Paused / Inactive</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 flex justify-center">
                        <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : filteredCoupons.length === 0 ? (
                    <div className="p-10 text-center text-text-muted">
                        <Ticket className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-sm font-semibold text-gray-700">No coupon offers found</p>
                        <p className="text-xs mt-0.5">Create your first discount code to start running promotions.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-primary/5 text-[10px] font-bold text-primary uppercase">
                                <tr>
                                    <th className="px-3.5 py-2">Coupon Code</th>
                                    <th className="px-3.5 py-2">Offer Title</th>
                                    <th className="px-3.5 py-2">Discount</th>
                                    <th className="px-3.5 py-2">Criteria</th>
                                    <th className="px-3.5 py-2">Redemptions</th>
                                    <th className="px-3.5 py-2">Validity</th>
                                    <th className="px-3.5 py-2 text-center">Status</th>
                                    <th className="px-3.5 py-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-custom text-xs">
                                {filteredCoupons.map((coupon) => {
                                    const isExpired = new Date(coupon.validUntil) < new Date()
                                    return (
                                        <tr key={coupon._id} className="hover:bg-background-soft transition-colors">
                                            <td className="px-3.5 py-2 font-mono font-bold text-primary">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="px-2 py-0.5 bg-primary/10 rounded-md text-primary tracking-wide text-xs">
                                                        {coupon.code}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(coupon.code)}
                                                        className="text-gray-400 hover:text-gray-600 transition"
                                                        title="Copy code"
                                                    >
                                                        {copiedCode === coupon.code ? (
                                                            <Check size={12} className="text-emerald-600" />
                                                        ) : (
                                                            <Copy size={12} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="px-3.5 py-2">
                                                <p className="font-semibold text-gray-900 leading-tight">{coupon.title}</p>
                                                {coupon.description && (
                                                    <p className="text-[11px] text-text-muted line-clamp-1">{coupon.description}</p>
                                                )}
                                            </td>

                                            <td className="px-3.5 py-2 font-bold text-emerald-600">
                                                {coupon.discountType === "percentage" ? (
                                                    <span>{coupon.discountValue}% OFF</span>
                                                ) : (
                                                    <span>₹{coupon.discountValue} FLAT OFF</span>
                                                )}
                                                {coupon.maxDiscountAmount && coupon.discountType === "percentage" && (
                                                    <p className="text-[10px] font-normal text-text-muted">
                                                        Up to ₹{coupon.maxDiscountAmount}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-3.5 py-2 text-[11px] text-text-muted">
                                                <p>Min Order: <span className="font-semibold text-gray-700">₹{coupon.minOrderValue}</span></p>
                                                <p>User Limit: <span className="font-semibold text-gray-700">{coupon.userUsageLimit || 1}</span></p>
                                            </td>

                                            <td className="px-3.5 py-2 text-[11px]">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-12 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className="bg-primary h-full rounded-full"
                                                            style={{
                                                                width: `${Math.min(100, Math.round(((coupon.usageCount || 0) / (coupon.usageLimit || 100)) * 100))}%`
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="font-semibold text-gray-800 text-[10px]">
                                                        {coupon.usageCount || 0}/{coupon.usageLimit || "∞"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-3.5 py-2 text-[11px] text-text-muted">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={11} />
                                                    <span>Until {new Date(coupon.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                                </div>
                                                {isExpired && (
                                                    <span className="inline-block mt-0.5 px-1 py-0.2 bg-red-50 text-red-600 font-bold text-[9px] rounded">
                                                        EXPIRED
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-3.5 py-2 text-center">
                                                <button
                                                    onClick={() => toggleStatus(coupon)}
                                                    className={cn(
                                                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition",
                                                        coupon.isActive && !isExpired
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                                            : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                                                    )}
                                                >
                                                    {coupon.isActive && !isExpired ? "Active" : "Paused"}
                                                </button>
                                            </td>

                                            <td className="px-3.5 py-2 text-center">
                                                <button
                                                    onClick={() => handleDelete(coupon._id)}
                                                    className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                                                    title="Delete Coupon"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Coupon Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-border-custom max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-border-custom">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Create New Coupon Campaign</h3>
                                <p className="text-xs text-text-muted mt-0.5">Set discount terms, minimum orders, and campaign limits.</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {formError && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleCreateCoupon} className="mt-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 uppercase">Coupon Code *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. FESTIVE20"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft font-mono uppercase text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 uppercase">Discount Type *</label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                                        className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="percentage">Percentage (%) OFF</option>
                                        <option value="flat">Flat Cash (₹) OFF</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase">Campaign Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 20% Off Festive Seafood Special"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 uppercase">
                                        Discount {formData.discountType === "percentage" ? "(%) *" : "(₹) *"}
                                    </label>
                                    <input
                                        type="number"
                                        placeholder={formData.discountType === "percentage" ? "20" : "100"}
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                                        required
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-700 uppercase">Min Order (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 499"
                                        value={formData.minOrderValue}
                                        onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                        className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-700 uppercase">Max Cap (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 150"
                                        disabled={formData.discountType === "flat"}
                                        value={formData.maxDiscountAmount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                        className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm outline-none disabled:opacity-40 focus:bg-white focus:ring-2 focus:ring-primary/20"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 uppercase">Expires On *</label>
                                    <input
                                        type="date"
                                        value={formData.validUntil}
                                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                        className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-700 uppercase">Total Limit</label>
                                    <input
                                        type="number"
                                        placeholder="100"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                        className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-700 uppercase">Per User</label>
                                    <input
                                        type="number"
                                        placeholder="1"
                                        value={formData.userUsageLimit}
                                        onChange={(e) => setFormData({ ...formData, userUsageLimit: e.target.value })}
                                        className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase">Description / Banner Subtitle</label>
                                <textarea
                                    placeholder="e.g. Valid on all Fresh Shrimp and Fish cuts above ₹499."
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                            </div>

                            <div className="pt-3 flex justify-end gap-3 border-t border-border-custom">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold border text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50"
                                >
                                    {submitting ? "Creating..." : "Launch Campaign"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
