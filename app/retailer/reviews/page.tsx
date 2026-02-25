"use client"

import { useState } from "react"
import { Star, Search, MoreVertical, MessageSquare, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"

const reviews = [
    { id: 1, user: "Anil Sharma", rating: 5, comment: "Fresh and high quality shimps. Highly recommended! The packaging was excellent and kept everything cold until I got home.", date: "24 Feb 2026", product: "Premium Tiger Shrimp", tags: ["Freshness", "Packaging"] },
    { id: 2, user: "Priya Roy", rating: 4, comment: "Good taste, delivery was on time. I would like to see more variety in sizes though.", date: "22 Feb 2026", product: "Whiteleg Shrimp", tags: ["Delivery"] },
    { id: 3, user: "Suresh K.", rating: 5, comment: "Amazing quality, best in the market. Shrimpbite never disappoints with their quality control.", date: "20 Feb 2026", product: "Tiger Shrimp", tags: ["Quality"] },
]

export default function RetailerReviewsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Customer Reviews</h1>
                    <p className="text-text-muted">Manage your shop's feedback and customer sentiment.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium shadow-md">
                    <Star size={16} className="fill-current" />
                    Review Settings
                </button>
            </div>

            {/* Review Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex flex-col justify-center text-center">
                    <p className="text-4xl font-black text-primary mb-1">4.8</p>
                    <div className="flex justify-center gap-1 text-warning mb-2">
                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Average Rating</p>
                </div>
                <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-8">
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-text-muted w-3">{rating}</span>
                                <div className="flex-1 h-2 bg-background-soft rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all"
                                        style={{ width: `${rating === 5 ? 75 : rating === 4 ? 20 : 5}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-bold text-text-muted w-10 text-right">
                                    {rating === 5 ? "75%" : rating === 4 ? "20%" : "2%"}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="hidden lg:block w-px h-full bg-border-custom"></div>
                    <div className="hidden lg:flex flex-col justify-center space-y-3">
                        <div className="text-center">
                            <p className="text-2xl font-bold">124</p>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total Reviews</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary">98%</p>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Positive Sent.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1 bg-background-soft p-1 rounded-lg">
                        {["All", "Positive", "Neutral", "Critical"].map(filter => (
                            <button
                                key={filter}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                                    filter === "All" ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-foreground"
                                )}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                            type="text"
                            placeholder="Search feedback..."
                            className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64"
                        />
                    </div>
                </div>

                <div className="divide-y border-border-custom">
                    {reviews.map((r) => (
                        <div key={r.id} className="p-6 hover:bg-background-soft/50 transition-colors group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center font-black text-primary text-lg overflow-hidden border border-border-custom shadow-sm">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.user}`} alt={r.user} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg flex items-center gap-2">
                                            {r.user}
                                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">Verified Buyer</span>
                                        </p>
                                        <p className="text-xs text-text-muted flex items-center gap-1">
                                            {r.date} • for <span className="text-primary font-black uppercase">{r.product}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex gap-0.5 text-warning">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "" : "text-slate-200"} />
                                        ))}
                                    </div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Excellent</p>
                                </div>
                            </div>

                            <p className="text-foreground text-sm leading-relaxed mb-4 max-w-3xl">
                                "{r.comment}"
                            </p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {r.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-background-soft rounded-full text-[10px] font-bold text-text-muted">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-border-custom/50">
                                <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all">
                                    <MessageSquare size={14} />
                                    Reply to {r.user.split(" ")[0]}
                                </button>
                                <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg border text-text-muted text-xs font-bold hover:bg-background-soft transition-all">
                                    <ThumbsUp size={14} />
                                    Helpful
                                </button>
                                <button className="ml-auto p-2 text-text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-background-soft/30 text-center">
                    <button className="text-sm font-bold text-primary hover:underline">View all historical feedback</button>
                </div>
            </div>
        </div>
    )
}
