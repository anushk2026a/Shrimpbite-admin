"use client"

import { useState, useEffect } from "react"
import { Star, Search, MoreVertical, MessageSquare, ThumbsUp, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import retailerService from "@/data/services/retailerService"

export default function RetailerReviewsPage() {
    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [reviewData, setReviewData] = useState<any>(null)
    const [filter, setFilter] = useState("All")
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        setMounted(true)
        fetchReviews()
    }, [])

    const fetchReviews = async () => {
        try {
            const res = await retailerService.getReviews()
            if (res.success) {
                setReviewData(res.data)
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error)
        } finally {
            setLoading(false)
        }
    }

    if (!mounted || loading || !reviewData) {
        return (
            <div className="space-y-6 animate-pulse p-4">
                <div className="h-12 bg-background-soft rounded-xl w-1/4" />
                <div className="h-40 bg-background-soft rounded-2xl w-full" />
                <div className="h-[500px] bg-background-soft rounded-2xl w-full" />
            </div>
        )
    }

    const { stats, reviews } = reviewData

    // Filter reviews
    const filteredReviews = reviews.filter((group: any) => {
        const searchStr = searchQuery.toLowerCase();
        const matchesSearch = 
            group.user.name.toLowerCase().includes(searchStr) || 
            group.orderId.toLowerCase().includes(searchStr) ||
            (group.overallExperience?.comment || "").toLowerCase().includes(searchStr) ||
            group.productRatings.some((pr: any) => pr.productName.toLowerCase().includes(searchStr));
            
        if (!matchesSearch) return false;

        const rating = group.overallExperience?.rating || (group.productRatings[0]?.rating || 0);

        if (filter === "Positive") return rating >= 4;
        if (filter === "Neutral") return rating === 3;
        if (filter === "Critical") return rating <= 2;
        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary uppercase">Customer Feedback</h1>
                    <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Manage your shop&apos;s feedback and customer sentiment.</p>
                </div>
            </div>

            {/* Review Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[32px] border border-border-custom shadow-sm flex flex-col justify-center text-center">
                    <p className="text-5xl font-black text-primary mb-1 tracking-tighter">{stats.averageRating || "0.0"}</p>
                    <div className="flex justify-center gap-1 text-warning mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} fill={i < Math.round(Number(stats.averageRating)) ? "currentColor" : "none"} className={i < Math.round(Number(stats.averageRating)) ? "" : "text-slate-100"} />
                        ))}
                    </div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Shop Rating</p>
                    <p className="text-[8px] text-text-muted mt-1 uppercase font-black opacity-50 underline decoration-primary/30 underline-offset-4">Comprehensive score</p>
                </div>
                <div className="md:col-span-3 bg-white p-8 rounded-[32px] border border-border-custom shadow-sm flex items-center gap-12">
                    <div className="flex-1 space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-text-muted w-4">{rating}</span>
                                <div className="flex-1 h-2.5 bg-background-soft rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-700"
                                        style={{ width: `${stats.distribution[rating] || 0}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-black text-text-muted w-10 text-right">
                                    {stats.distribution[rating] || 0}%
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="hidden lg:block w-px h-16 bg-border-custom/50"></div>
                    <div className="hidden lg:flex items-center gap-12">
                        <div className="text-center">
                            <p className="text-3xl font-black tracking-tight">{stats.totalReviews}</p>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.15em] mt-1">Total Ratings</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-emerald-500 tracking-tight">{stats.positivePercentage}%</p>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.15em] mt-1">Happy Customers</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-border-custom shadow-sm overflow-hidden">
                <div className="p-8 border-b border-border-custom flex flex-wrap items-center justify-between gap-6 bg-background-soft/30">
                    <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-border-custom shadow-sm">
                        {["All", "Positive", "Neutral", "Critical"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                    filter === f ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-muted hover:text-primary"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search orders, customers..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-12 pr-6 py-3 rounded-2xl bg-white border border-border-custom text-xs font-bold outline-none w-80 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-text-muted/60 shadow-sm"
                        />
                    </div>
                </div>

                <div className="divide-y divide-border-custom/50">
                    {filteredReviews.length === 0 ? (
                        <div className="p-24 text-center text-text-muted flex flex-col items-center gap-4">
                            <Star size={48} className="opacity-10" />
                            <div className="space-y-1">
                                <p className="font-black text-sm uppercase tracking-widest">No matching feedback</p>
                                <p className="text-xs font-medium">Try adjusting your filters or search query.</p>
                            </div>
                        </div>
                    ) : (
                        filteredReviews.map((group: any, idx: number) => (
                            <div key={idx} className="p-8 hover:bg-background-soft/30 transition-colors group">
                                <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                                    {/* Left: Customer Info */}
                                    <div className="flex items-center gap-4 lg:w-72 shrink-0">
                                        <div className="w-16 h-16 rounded-[24px] bg-primary/5 flex items-center justify-center p-0.5 border border-border-custom shadow-sm relative shrink-0">
                                            <img 
                                                src={group.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${group.user.name}`} 
                                                alt={group.user.name} 
                                                className="w-full h-full object-cover rounded-[22px]"
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg border-2 border-white flex items-center justify-center">
                                                <ThumbsUp size={10} className="text-white" fill="currentColor" />
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-primary uppercase text-sm truncate">{group.user.name}</p>
                                            <p className="text-[10px] font-bold text-text-muted mb-2">{group.user.phone}</p>
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-[0.15em] rounded-full border border-emerald-100">Verified Order</span>
                                        </div>
                                    </div>

                                    {/* Middle: Review Content */}
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-background-soft px-3 py-1 rounded-lg">
                                                    {group.orderId}
                                                </p>
                                                <span className="text-[10px] font-bold text-text-muted">{group.date}</span>
                                            </div>
                                            
                                            {group.overallExperience && (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-0.5 text-warning">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < group.overallExperience.rating ? "currentColor" : "none"} className={i < group.overallExperience.rating ? "" : "text-slate-100"} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{group.overallExperience.rating}.0 • Overall</span>
                                                </div>
                                            )}
                                        </div>

                                        {group.overallExperience?.comment && (
                                            <p className="text-sm font-medium leading-relaxed italic text-gray-700 bg-white/50 p-4 rounded-2xl border border-dashed border-border-custom">
                                                &quot;{group.overallExperience.comment}&quot;
                                            </p>
                                        )}

                                        {/* Product Specific Ratings */}
                                        {group.productRatings.length > 0 && (
                                            <div className="space-y-4">
                                                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <span className="h-px bg-border-custom flex-1" />
                                                    Product Feedback
                                                    <span className="h-px bg-border-custom flex-1" />
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {group.productRatings.map((pr: any, i: number) => (
                                                        <div key={i} className="bg-white p-4 rounded-2xl border border-border-custom shadow-sm hover:border-primary/20 transition-all group/item">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <p className="text-[11px] font-black text-primary uppercase tracking-tight truncate">{pr.productName}</p>
                                                                <div className="flex gap-0.5 text-warning scale-75 origin-right">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} size={14} fill={i < pr.rating ? "currentColor" : "none"} className={i < pr.rating ? "" : "text-slate-100"} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {pr.comment && (
                                                                <p className="text-[10px] text-text-muted font-medium italic line-clamp-2 leading-snug">
                                                                    &quot;{pr.comment}&quot;
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Actions / Info (Cleaned up as per request) */}
                                    <div className="shrink-0 flex flex-col items-center lg:w-48 opacity-20 group-hover:opacity-40 transition-opacity">
                                        <div className="hidden lg:flex flex-col items-center gap-1 mt-12">
                                            <div className="w-1.5 h-1.5 rounded-full bg-border-custom" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-border-custom" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-border-custom" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-8 bg-background-soft/50 text-center border-t border-border-custom">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">
                        End of feedback records
                    </p>
                </div>
            </div>
        </div>
    )
}
