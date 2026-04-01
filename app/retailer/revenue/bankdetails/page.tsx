"use client"

import { useState } from "react"
import { ArrowLeft, Building2, Plus, Trash2, Check, X, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import retailerService from "@/data/services/retailerService"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function BankDetailsPage() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [showAddModal, setShowAddModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [bankToDelete, setBankToDelete] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState("")

    const [bankData, setBankData] = useState({
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountHolderName: ""
    })

    const { data: bankAccounts = [], isLoading } = useQuery({
        queryKey: ["retailerBankAccounts"],
        queryFn: async () => {
            const res = await retailerService.getBankAccounts()
            return res.bankAccounts || []
        }
    })

    const validateForm = () => {
        setFormError("")
        if (!/^\d+$/.test(bankData.accountNumber)) {
            setFormError("Account number must contain only numbers.")
            return false
        }
        if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(bankData.ifscCode)) {
            setFormError("Invalid IFSC code. It must be 11 characters, start with 4 letters, then a '0', and end with 6 alphanumeric characters.")
            return false
        }
        return true
    }

    const handleAddBank = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setSubmitting(true)
        try {
            await retailerService.addBankAccount(bankData)
            toast.success("Bank account added successfully!")
            queryClient.invalidateQueries({ queryKey: ["retailerBankAccounts"] })
            setShowAddModal(false)
            setBankData({ bankName: "", accountNumber: "", ifscCode: "", accountHolderName: "" })
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add bank account.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteBank = async () => {
        if (!bankToDelete) return
        
        try {
            await retailerService.deleteBankAccount(bankToDelete)
            toast.success("Bank account removed successfully!")
            queryClient.invalidateQueries({ queryKey: ["retailerBankAccounts"] })
            setShowDeleteConfirm(false)
            setBankToDelete(null)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete bank account.")
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center bg-white border border-border-custom rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft size={18} className="text-text-primary" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Bank Details</h1>
                        <p className="text-text-muted mt-1">Manage your linked accounts for payout settlements.</p>
                    </div>
                </div>
                <div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#69B82C] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#69B82C]/90 transition-all shadow-lg shadow-[#69B82C]/20"
                    >
                        <Plus size={18} /> Add New Bank
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    // Skeleton Loaders
                    [1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-[32px] p-8 border border-border-custom shadow-sm animate-pulse h-48" />
                    ))
                ) : bankAccounts.length === 0 ? (
                    <div className="col-span-full bg-white rounded-[40px] border border-border-custom p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                            <Building2 size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Bank Accounts Found</h3>
                        <p className="text-gray-500 max-w-sm">You haven't added any settlement bank accounts yet. Add one to receive your payouts securely.</p>
                    </div>
                ) : (
                    bankAccounts.map((bank: any) => (
                        <div key={bank._id} className="bg-white rounded-[32px] p-8 border-2 border-transparent hover:border-[#69B82C]/20 transition-all shadow-sm relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                                <Building2 size={100} />
                            </div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-2xl">
                                    <Building2 size={24} />
                                </div>
                                <button
                                    onClick={() => {
                                        setBankToDelete(bank._id);
                                        setShowDeleteConfirm(true);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="space-y-1 z-10 relative">
                                <p className="text-[10px] font-black tracking-widest text-[#FF5E1E] uppercase">{bank.bankName}</p>
                                <h3 className="text-xl font-bold tracking-tight text-gray-900">
                                    •••• {bank.accountNumber?.slice(-4)}
                                </h3>
                                <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">A/C Holder</p>
                                        <p className="text-sm font-bold text-gray-700 truncate">{bank.accountHolderName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">IFSC</p>
                                        <p className="text-sm font-bold text-gray-700 uppercase">{bank.ifscCode}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Bank Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <form onSubmit={handleAddBank} className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Add Bank Account</h2>
                            <button type="button" onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} className="text-text-muted" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {formError && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600 font-medium text-sm">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <p>{formError}</p>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Bank Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="State Bank of India"
                                    value={bankData.bankName}
                                    onChange={e => setBankData({ ...bankData, bankName: e.target.value })}
                                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#69B82C]/30 outline-none transition-all font-bold text-gray-800"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Account Holder Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Name as registered with bank"
                                    value={bankData.accountHolderName}
                                    onChange={e => setBankData({ ...bankData, accountHolderName: e.target.value })}
                                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#69B82C]/30 outline-none transition-all font-bold text-gray-800"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Account Number</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Bank account number"
                                    value={bankData.accountNumber}
                                    onChange={e => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setBankData({ ...bankData, accountNumber: val })
                                    }}
                                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#69B82C]/30 outline-none transition-all font-bold text-gray-800 tracking-wider"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">IFSC Code</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={11}
                                    placeholder="SBIN0001234"
                                    value={bankData.ifscCode}
                                    onChange={e => {
                                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                        setBankData({ ...bankData, ifscCode: val })
                                    }}
                                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#69B82C]/30 outline-none transition-all font-bold text-gray-800 uppercase tracking-widest"
                                />
                            </div>
                        </div>

                        <div className="p-8 pt-0 flex gap-4">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black uppercase text-sm rounded-2xl transition-colors">
                                Cancel
                            </button>
                            <button disabled={submitting} className="flex-1 py-4 bg-[#69B82C] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#69B82C]/90 transition-all shadow-lg shadow-[#69B82C]/20 disabled:opacity-50">
                                {submitting ? "Saving..." : "Save Bank"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 p-8 text-center">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Confirm Removal</h2>
                        <p className="text-gray-500 mb-8 font-medium">Are you sure you want to delete this bank account? This action cannot be undone.</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black uppercase text-sm rounded-2xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteBank}
                                className="py-4 bg-red-500 text-white font-black uppercase text-sm rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
