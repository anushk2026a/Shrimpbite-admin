"use client"

import { useState, useEffect } from "react"
import { Wallet, ArrowUpRight, Clock, CheckCircle2, DollarSign, Download, Filter, Plus, X, Building2, Info, ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import retailerService from "@/data/services/retailerService"
import socket from "@/data/api/socket"
import { toast } from "sonner"

interface Payout {
    _id: string;
    amount: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
    transactionId?: string;
}

import { useQuery, useQueryClient } from "@tanstack/react-query"

export default function RetailerRevenuePage() {
    const queryClient = useQueryClient()
    const router = useRouter()
    const [showPayoutModal, setShowPayoutModal] = useState(false)
    const [payoutAmount, setPayoutAmount] = useState("")
    const [selectedBankId, setSelectedBankId] = useState("")
    const [submitting, setSubmitting] = useState(false)

    // Using React Query for revenue stats fetching & caching
    const { data: revenueStats = {
        availableBalance: 0,
        estimatedEarnings: 0,
        totalSettled: 0,
        totalEarnings: 0
    }, isLoading: loadingStats } = useQuery({
        queryKey: ["retailerRevenueStats"],
        queryFn: async () => {
            const res = await retailerService.getRevenueStats()
            return res.data
        },
        staleTime: 5 * 1000, // Frequent updates for money
    })

    // Fetch saved bank accounts
    const { data: bankAccounts = [], isLoading: loadingBanks } = useQuery({
        queryKey: ["retailerBankAccounts"],
        queryFn: async () => {
            const res = await retailerService.getBankAccounts()
            return res.bankAccounts || []
        }
    })

    // Using React Query for payout history fetching & caching
    const { data: payouts = [], isLoading: loadingPayouts } = useQuery<Payout[]>({
        queryKey: ["retailerPayoutHistory"],
        queryFn: async () => {
            return await retailerService.getPayoutHistory()
        },
        staleTime: 2 * 60 * 1000,
    })

    // Sockets for real-time updates
    useEffect(() => {
        if (!socket.connected) socket.connect();

        const handlePayoutUpdate = (data: any) => {
            console.log("💰 [RETAILER SOCKET] Payout Update Received:", data);
            // Invalidate all revenue-related queries
            queryClient.invalidateQueries({ queryKey: ["retailerRevenueStats"] });
            queryClient.invalidateQueries({ queryKey: ["retailerPayoutHistory"] });
            
            toast.success("Payout Status Updated!", {
                description: `Your payout for ₹${data.amount} is now ${data.status.toUpperCase()}.`
            });
        };

        socket.on("payoutUpdate", handlePayoutUpdate);

        return () => {
            socket.off("payoutUpdate", handlePayoutUpdate);
        };
    }, [queryClient]);

    const handleRequestPayout = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedBankId) {
            alert("Please select a settlement bank account.")
            return
        }

        const chosenBank = bankAccounts.find((b: { _id: string }) => b._id === selectedBankId);
        
        setSubmitting(true)
        try {
            await retailerService.requestPayout({
                amount: Number(payoutAmount),
                bankDetails: {
                    bankName: chosenBank.bankName,
                    accountNumber: chosenBank.accountNumber,
                    ifscCode: chosenBank.ifscCode
                }
            })
            // Invalidate current queries to refresh from server
            queryClient.invalidateQueries({ queryKey: ["retailerRevenueStats"] })
            queryClient.invalidateQueries({ queryKey: ["retailerPayoutHistory"] })
            setShowPayoutModal(false)
            setPayoutAmount("")
            setSelectedBankId("")
        } catch (error) {
            console.error("Payout request failed:", error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Revenue & Settlements</h1>
                    <p className="text-text-muted mt-1">Track your earnings and manage your payouts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/retailer/revenue/bankdetails')}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-border-custom text-text-primary rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-background-soft transition-all shadow-sm"
                    >
                        <Building2 size={18} /> Bank Details
                    </button>
                    <button
                        onClick={() => setShowPayoutModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} /> Request Payout
                    </button>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary rounded-[32px] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Wallet size={80} />
                    </div>
                    <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-2">Available for Payout</p>
                    {loadingStats ? (
                        <div className="h-10 bg-white/20 rounded animate-pulse w-32" />
                    ) : (
                        <h2 className="text-4xl font-black">₹{revenueStats.availableBalance.toLocaleString()}</h2>
                    )}
                    <div className="mt-6 flex items-center gap-2 text-xs font-bold text-green-300">
                        <ArrowUpRight size={14} /> Based on completed orders
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-border-custom shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-2">Estimated Earnings</p>
                    {loadingStats ? (
                        <div className="h-9 bg-background-soft rounded animate-pulse w-32" />
                    ) : (
                        <h2 className="text-3xl font-black text-primary">₹{revenueStats.estimatedEarnings.toLocaleString()}</h2>
                    )}
                    <p className="mt-2 text-xs font-bold text-text-muted uppercase">This Month</p>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-border-custom shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-2">Total Settled</p>
                    {loadingStats ? (
                        <div className="h-9 bg-background-soft rounded animate-pulse w-32" />
                    ) : (
                        <h2 className="text-3xl font-black text-green-600">₹{revenueStats.totalSettled.toLocaleString()}</h2>
                    )}
                    <p className="mt-2 text-xs font-bold text-text-muted uppercase">Lifetime Earnings: ₹{revenueStats.totalEarnings.toLocaleString()}</p>
                </div>
            </div>

            {/* Settlements History */}
            <div className="bg-white rounded-[40px] border border-border-custom shadow-xl overflow-hidden">
                <div className="p-8 border-b border-border-custom flex items-center justify-between">
                    <h3 className="text-xl font-black text-primary uppercase tracking-tight">Recent Settlements</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background-soft/50">
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Payout ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">UTR / Proof</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom/50">
                            {loadingPayouts ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6 h-16 bg-gray-50/30" />
                                    </tr>
                                ))
                            ) : payouts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <p className="text-text-muted font-bold">No payout history found.</p>
                                    </td>
                                </tr>
                            ) : (
                                payouts.map((payout) => (
                                    <tr key={payout._id} className="hover:bg-background-soft/20 transition-colors">
                                        <td className="px-8 py-6 text-sm font-bold text-primary truncate max-w-[150px]">
                                            #{payout._id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-black text-primary">₹{payout.amount.toLocaleString()}</p>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-medium text-text-muted">
                                            {new Date(payout.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                payout.status === 'Approved' ? "bg-green-50 text-green-600 border-green-100" :
                                                    payout.status === 'Pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        "bg-red-50 text-red-600 border-red-100"
                                            )}>
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-mono font-bold text-primary">{payout.transactionId || '---'}</p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payout Request Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <form
                        onSubmit={handleRequestPayout}
                        className="bg-white rounded-[48px] w-full max-w-xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(255,107,53,0.3)] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 relative"
                    >
                        {/* Branded Header Gradient */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF6B35] via-[#FF3B30] to-[#6CC51D] z-10" />
                        
                        {/* Background Logo Watermark */}
                        <div className="absolute -right-20 -top-20 opacity-[0.03] rotate-12 pointer-events-none">
                            <Wallet size={300} className="text-[#FF6B35]" />
                        </div>

                        <div className="p-8 border-b border-background-soft flex items-center justify-between relative bg-white">
                            <div>
                                <h2 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF3B30] flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                        <DollarSign size={18} />
                                    </div>
                                    Request Payout
                                </h2>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1 ml-10">Instant settlement to your bank</p>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setShowPayoutModal(false)} 
                                className="w-12 h-12 flex items-center justify-center hover:bg-red-50 hover:text-red-500 rounded-full transition-all group"
                            >
                                <X size={24} className="text-text-muted group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 relative bg-white">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                    Payout Amount (₹)
                                    <Info size={12} className="text-primary/40" />
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-primary/20 group-focus-within:text-[#FF6B35] transition-colors">₹</div>
                                    <input
                                        type="number"
                                        required
                                        min="500"
                                        max={revenueStats.availableBalance}
                                        placeholder="0.00"
                                        value={payoutAmount}
                                        onChange={e => setPayoutAmount(e.target.value)}
                                        className="w-full pl-14 pr-6 py-6 rounded-[32px] bg-background-soft border-4 border-transparent focus:border-[#FF6B35]/10 focus:bg-white outline-none transition-all font-black text-4xl text-primary placeholder:text-primary/5 shadow-inner"
                                    />
                                    {/* Quick Tabs */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => setPayoutAmount(revenueStats.availableBalance.toString())}
                                            className="px-3 py-1.5 rounded-xl bg-white border border-border-custom text-[10px] font-black text-primary hover:border-[#FF6B35] transition-all"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between px-2">
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                                        Available: <span className="text-primary font-black">₹{revenueStats.availableBalance.toLocaleString()}</span>
                                    </p>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Min. Withdrawal: ₹500</p>
                                </div>
                            </div>

                            <div className="bg-background-soft rounded-[40px] p-8 space-y-6 border border-border-custom/50">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black text-primary uppercase tracking-widest opacity-50">Settlement Destination</h3>
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                        <Building2 size={14} className="text-[#FF6B35]" />
                                    </div>
                                </div>
                                
                                {loadingBanks ? (
                                    <div className="h-14 w-full bg-white animate-pulse rounded-2xl border-2 border-dashed border-gray-200"></div>
                                ) : bankAccounts.length === 0 ? (
                                    <div className="text-sm font-medium text-gray-500 border border-gray-200 rounded-2xl p-4 text-center bg-white">
                                        No bank accounts found.{' '}
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setShowPayoutModal(false);
                                                router.push('/retailer/revenue/bankdetails');
                                            }}
                                            className="text-[#FF6B35] font-bold hover:underline"
                                        >
                                            Add one now
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <select
                                            required
                                            value={selectedBankId}
                                            onChange={e => setSelectedBankId(e.target.value)}
                                            className="w-full bg-white border-2 border-transparent group-hover:border-[#FF6B35]/20 focus:border-[#FF6B35] focus:ring-4 focus:ring-orange-500/5 outline-none py-4 px-6 rounded-2xl font-black text-sm transition-all text-primary shadow-sm appearance-none"
                                        >
                                            <option value="" disabled>Select a saved bank account...</option>
                                            {bankAccounts.map((bank: any) => (
                                                <option key={bank._id} value={bank._id}>
                                                    {bank.bankName} - A/C ending in {bank.accountNumber?.slice(-4) || ''}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 pt-0 bg-white">
                            <button
                                type="submit"
                                disabled={submitting || Number(payoutAmount) < 500}
                                className={cn(
                                    "w-full py-6 rounded-[32px] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl flex items-center justify-center gap-4 group",
                                    submitting || Number(payoutAmount) < 500 
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" 
                                        : "bg-gradient-to-r from-[#FF6B35] to-[#FF3B30] text-white shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] hover:shadow-orange-500/60"
                                )}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Processing Request...
                                    </>
                                ) : (
                                    <>
                                        Submit Payout Request
                                        <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            <p className="text-[9px] text-center text-text-muted mt-6 font-bold uppercase tracking-widest leading-relaxed">
                                Funds will be settled within 24-48 business hours<br/>
                                subject to bank clearances.
                            </p>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
