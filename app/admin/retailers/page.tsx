"use client"

import { useState, useEffect } from "react"
import { Search, Filter, MoreVertical, User, Mail, Shield, UserCheck, UserX, Clock, Eye, X, CheckSquare, AlertCircle, Building, MapPin, FileText, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface Retailer {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    whatsappNumber?: string;
    status: string;
    rejectionReason?: string;
    businessDetails?: {
        businessName?: string;
        businessType?: string;
        location?: {
            address?: string;
            city?: string;
            state?: string;
            pincode?: string;
            landmark?: string;
        };
        legal?: {
            gst?: string;
            fssai?: string;
        };
    };
}

export default function RetailersPage() {
    const [retailers, setRetailers] = useState<Retailer[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("under_review")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null)
    const [rejectionReason, setRejectionReason] = useState("")
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchRetailers()
    }, [filter])

    const fetchRetailers = async () => {
        setLoading(true)
        try {
            const response = await fetch(`http://localhost:5000/api/admin/retailers?status=${filter}`)
            const data = await response.json()
            setRetailers(data)
        } catch (error) {
            console.error("Error fetching retailers:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (userId: string, status: string) => {
        if (status === "rejected" && !rejectionReason) {
            alert("Please provide a rejection reason.")
            return
        }

        setActionLoading(true)
        try {
            const response = await fetch("http://localhost:5000/api/admin/retailers/status", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, status, rejectionReason })
            })

            if (response.ok) {
                setSelectedRetailer(null)
                setRejectionReason("")
                fetchRetailers()
            } else {
                const err = await response.json()
                alert(err.message || "Action failed")
            }
        } catch (error) {
            console.error(error)
            alert("Action failed")
        } finally {
            setActionLoading(false)
        }
    }

    const filteredRetailers = retailers.filter(r =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.businessDetails?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Retailer Management</h1>
                    <p className="text-text-muted">Review and manage platform partners.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
                <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {["under_review", "approved", "rejected", "draft"].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                                    filter === s ? "bg-[#1B2D1F] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                )}
                            >
                                {s.replace("_", " ").toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 flex justify-center"><Clock className="animate-spin text-primary" /></div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-primary/5 text-xs font-bold text-primary uppercase tracking-wider border-b border-border-custom">
                                    <th className="px-6 py-4">Business</th>
                                    <th className="px-6 py-4">Owner</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-custom text-sm">
                                {filteredRetailers.map((ret) => (
                                    <tr key={ret._id} className="hover:bg-background-soft/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{ret.businessDetails?.businessName || "Not Set"}</span>
                                                <span className="text-xs text-text-muted">{ret.businessDetails?.location?.city}, {ret.businessDetails?.location?.state}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{ret.name}</span>
                                                <span className="text-xs text-text-muted">{ret.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-lg bg-background-soft text-text-muted font-medium border border-border-custom text-xs">
                                                {ret.businessDetails?.businessType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest",
                                                ret.status === "approved" ? "bg-green-50 text-green-600 border-green-100" :
                                                    ret.status === "under_review" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                        "bg-red-50 text-red-600 border-red-100"
                                            )}>
                                                {ret.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setSelectedRetailer(ret)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Review">
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRetailers.length === 0 && (
                                    <tr><td colSpan={5} className="p-12 text-center text-text-muted">No retailers found</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            {selectedRetailer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-8 sticky top-0 bg-white border-b flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-2xl font-bold">Review Application</h2>
                                <p className="text-sm text-gray-500">Retailer ID: {selectedRetailer._id}</p>
                            </div>
                            <button onClick={() => setSelectedRetailer(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 grid md:grid-cols-2 gap-12">
                            {/* Left Col: Details */}
                            <div className="space-y-8">
                                <section>
                                    <h3 className="font-bold text-[#FF6B00] text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Building size={14} /> Store Profile
                                    </h3>
                                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold">BUSINESS NAME</p>
                                            <p className="font-bold text-lg">{selectedRetailer.businessDetails?.businessName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold">STORE TYPE</p>
                                            <p className="font-medium">{selectedRetailer.businessDetails?.businessType}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold">ADDRESS</p>
                                            <p className="text-sm">{selectedRetailer.businessDetails?.location?.address}, {selectedRetailer.businessDetails?.location?.city}, {selectedRetailer.businessDetails?.location?.state} - {selectedRetailer.businessDetails?.location?.pincode}</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="font-bold text-[#FF6B00] text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <User size={14} /> Owner Details
                                    </h3>
                                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold">NAME</p>
                                                <p className="font-bold">{selectedRetailer.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold">PHONE</p>
                                                <p className="font-bold">{selectedRetailer.phone || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold">WHATSAPP</p>
                                                <p className="font-medium text-green-600">{selectedRetailer.whatsappNumber || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold">EMAIL</p>
                                                <p className="font-medium">{selectedRetailer.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="font-bold text-[#FF6B00] text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <FileText size={14} /> Documents & Compliance
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 border rounded-2xl flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400">BUSINESS LICENSE</p>
                                                <p className="text-xs font-bold text-blue-600 uppercase">View File</p>
                                            </div>
                                            <Eye size={16} className="text-gray-400" />
                                        </div>
                                        <div className="p-4 border rounded-2xl flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400">GST CERTIFICATE</p>
                                                <p className="text-xs font-bold text-blue-600 uppercase">View File</p>
                                            </div>
                                            <Eye size={16} className="text-gray-400" />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right Col: Actions */}
                            <div className="space-y-8">
                                <section>
                                    <h3 className="font-bold text-[#FF6B00] text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <AlertCircle size={14} /> Decision
                                    </h3>
                                    <div className="space-y-4">
                                        <textarea
                                            placeholder="Write rejection reason here (mandatory for rejection)..."
                                            value={rejectionReason}
                                            onChange={e => setRejectionReason(e.target.value)}
                                            className="w-full h-32 px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500/10 text-sm"
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                disabled={actionLoading}
                                                onClick={() => handleUpdateStatus(selectedRetailer._id, "rejected")}
                                                className="py-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <UserX size={18} /> Reject
                                            </button>
                                            <button
                                                disabled={actionLoading}
                                                onClick={() => handleUpdateStatus(selectedRetailer._id, "approved")}
                                                className="py-4 rounded-2xl bg-[#1B2D1F] text-white font-bold hover:bg-[#2A3E2D] hover:shadow-xl transition-all shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <UserCheck size={18} /> Approve
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 italic text-xs text-blue-800 leading-relaxed">
                                    "Approving will grant the retailer immediate access to their dashboard and all selling features. They will receive an automated email notification."
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
