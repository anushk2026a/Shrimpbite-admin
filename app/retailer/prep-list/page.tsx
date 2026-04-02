"use client"

import { useState, useEffect } from "react"
import { Fish, Package, ChevronRight, CheckCircle2, AlertCircle, Clock, Printer } from "lucide-react"
import { cn } from "@/lib/utils"
import retailerService from "@/data/services/retailerService"
import socket from "@/data/api/socket"

interface PrepSummary {
    id: string;
    productName: string;
    category: string;
    quantity: number;
    unit: string;
    orderCount: number;
    subscriptionCount: number;
    oneTimeCount: number;
    processedCount: number;
    status: 'Pending' | 'Ready' | 'Shortage';
}

interface DetailedItem {
    id: string;
    orderId: string;
    orderType: string;
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    status: string;
}

interface PrepData {
    summary: PrepSummary[];
    detailed: DetailedItem[];
}

import { useQuery, useQueryClient } from "@tanstack/react-query"

export default function DailyPrepListPage() {
    const queryClient = useQueryClient()
    const [selectedDate, setSelectedDate] = useState(new Date())

    // Using React Query for prep list fetching & caching
    const { data: prepData, isLoading } = useQuery<PrepData>({
        queryKey: ["retailerPrepList", selectedDate.toDateString()],
        queryFn: async () => {
            const response = await retailerService.getPrepList(selectedDate.toISOString())
            return response.data || { summary: [], detailed: [] }
        },
        staleTime: 2 * 60 * 1000, 
    })

    const prepItems = prepData?.summary || []
    const detailedItems = prepData?.detailed || []

    useEffect(() => {
        const userId = localStorage.getItem("userId")
        if (userId) {
            // Join specific retailer room
            socket.emit("join", `retailer_${userId}`)
            
            const handleSync = () => {
                queryClient.invalidateQueries({ queryKey: ["retailerPrepList"] })
            }

            socket.on("orderUpdate", handleSync)
            socket.on("inventorySync", handleSync)

            // Auto-rejoin on reconnection
            socket.on("connect", () => {
                socket.emit("join", `retailer_${userId}`)
            })
        }

        return () => {
            socket.off("orderUpdate")
            socket.off("inventorySync")
            socket.off("connect")
        }
    }, [queryClient])

    const totalWeight = prepItems.reduce((sum, item) => sum + item.quantity, 0).toFixed(1)
    const totalOrders = prepItems.reduce((sum, item) => sum + item.orderCount, 0)
    const readyOrders = prepItems.reduce((sum, item) => sum + item.processedCount, 0)

    const isToday = selectedDate.toDateString() === new Date().toDateString();
    const isFuture = selectedDate > new Date();

    const dateOptions = [
        { label: "Today", date: new Date() },
        { label: "Tomorrow", date: new Date(new Date().setDate(new Date().getDate() + 1)) },
        { label: "Day After", date: new Date(new Date().setDate(new Date().getDate() + 2)) },
    ];

    if (isLoading) {
        return <div className="p-10 space-y-8 animate-pulse text-foreground">
            <div className="h-10 bg-background-soft rounded-lg w-1/4" />
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-background-soft rounded-[32px]" />)}
            </div>
            <div className="h-96 bg-background-soft rounded-[32px]" />
        </div>
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">
                        {isToday ? "Daily Prep List" : isFuture ? "Future Prep Prediction" : "Historical Prep List"}
                    </h1>
                    <p className="text-text-muted mt-1 font-bold">
                        {isFuture 
                            ? `Predicted inventory for ${selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`
                            : "Granular packing requirements for today's subscription & pre-orders."
                        }
                    </p>
                </div>
                
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-gray-100 shadow-sm">
                    {dateOptions.map((opt) => (
                        <button
                            key={opt.label}
                            onClick={() => setSelectedDate(opt.date)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                selectedDate.toDateString() === opt.date.toDateString()
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-text-muted hover:bg-background-soft"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                    <div className="w-[1px] h-6 bg-border-custom mx-1" />
                    <input 
                        type="date" 
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="text-[10px] font-black uppercase text-primary bg-transparent outline-none cursor-pointer px-2"
                    />
                </div>
            </div>

            {/* Prep Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-7 rounded-[32px] border-2 border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 opacity-60">Total Products</p>
                    <h3 className="text-3xl font-black text-primary">{prepItems.length}</h3>
                </div>
                <div className="bg-white p-7 rounded-[32px] border-2 border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 opacity-60">Total Prep Weight</p>
                    <h3 className="text-3xl font-black text-primary">{totalWeight} <span className="text-sm">kg</span></h3>
                </div>
                <div className="bg-white p-7 rounded-[32px] border-2 border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 opacity-60">Items In Progress</p>
                    <h3 className="text-3xl font-black text-orange-600">{totalOrders - readyOrders}</h3>
                </div>
                <div className={cn(
                    "p-7 rounded-[32px] border-2 shadow-sm transition-colors",
                    readyOrders === totalOrders && totalOrders > 0 ? "bg-green-50 border-green-200" : "bg-white border-gray-100"
                )}>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 opacity-60">Packed / Ready</p>
                    <h3 className={cn("text-3xl font-black", readyOrders === totalOrders && totalOrders > 0 ? "text-green-600" : "text-gray-400")}>
                        {readyOrders} / {totalOrders}
                    </h3>
                </div>
            </div>

            {/* Granular Table View */}
            <div className="bg-white rounded-[40px] border-2 border-gray-100 shadow-sm overflow-hidden mb-20">
                <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-primary tracking-tight uppercase">Packing List</h3>
                        <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Line-by-line item requirements</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/30">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Order ID</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Product Details</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Mode</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Quantity</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {detailedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-text-muted">
                                            <Package size={48} className="opacity-10 mb-4" />
                                            <p className="font-bold text-sm">No prep requirements for this date.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                detailedItems.map((item) => (
                                    <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "font-black text-sm tracking-tighter uppercase",
                                                item.orderId === "WAITING-BILLING" ? "text-orange-500 italic" : "text-primary"
                                            )}>
                                                #{item.orderId}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <Fish size={20} />
                                                </div>
                                                <span className="font-black text-primary/80 text-sm tracking-tight uppercase">
                                                    {item.productName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {item.orderType === "Subscription" ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[9px] font-black uppercase tracking-wider border border-green-100">
                                                    ↻ Sub
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-wider border border-blue-100">
                                                    1x One-off
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="font-black text-lg tracking-tighter text-primary">
                                                {item.quantity} <span className="text-[10px] opacity-60 ml-0.5">{item.unit}</span>
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                item.status === "Delivered" || item.status === "Completed" 
                                                    ? "bg-green-50 text-green-600 border border-green-200" 
                                                    : ["Accepted", "Processing", "Preparing", "Shipped", "Out for Delivery", "Rider Assigned", "Rider Accepted"].includes(item.status)
                                                        ? "bg-primary/5 text-primary border border-primary/20"
                                                        : "bg-gray-50 text-gray-400 border border-gray-100"
                                            )}>
                                                {item.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
