"use client"

import { useState, useEffect } from "react"
import { Fish, Package, ChevronRight, CheckCircle2, AlertCircle, Clock, Printer } from "lucide-react"
import { cn } from "@/lib/utils"
import retailerService from "@/data/services/retailerService"
import socket from "@/data/api/socket"

interface PrepItem {
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

import { useQuery, useQueryClient } from "@tanstack/react-query"

export default function DailyPrepListPage() {
    const queryClient = useQueryClient()

    // Using React Query for prep list fetching & caching
    const { data: prepItems = [], isLoading } = useQuery<PrepItem[]>({
        queryKey: ["retailerPrepList"],
        queryFn: async () => {
            const response = await retailerService.getPrepList()
            return response.data || []
        },
        staleTime: 2 * 60 * 1000, // Refresh every 2 minutes or on socket events
    })

    useEffect(() => {
        // Socket real-time updates
        const userId = localStorage.getItem("userId")
        if (userId) {
            socket.connect()
            socket.on("connect", () => {
                socket.emit("join", `retailer_${userId}`)
            })
            socket.on("orderUpdate", (data) => {
                console.log("⚡ Prep List Status Sync:", data)
                // Invalidate query to refresh the list from server
                queryClient.invalidateQueries({ queryKey: ["retailerPrepList"] })
            })
        }

        return () => {
            socket.off("orderUpdate")
            socket.disconnect()
        }
    }, [queryClient])

    const totalWeight = prepItems.reduce((sum, item) => sum + item.quantity, 0).toFixed(1)
    const totalOrders = prepItems.reduce((sum, item) => sum + item.orderCount, 0)
    const readyOrders = prepItems.reduce((sum, item) => sum + item.processedCount, 0)


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Daily Prep List</h1>
                    <p className="text-text-muted mt-1">Inventory requirements for today&apos;s subscription &amp; pre-orders.</p>
                </div>

            </div>

            {/* Date Info */}
            <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black">
                    {new Date().getDate()}
                </div>
                <div>
                    <p className="font-black text-primary uppercase tracking-tight">Orders for {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Cut-off completed at 11:00 PM last night</p>
                </div>
            </div>

            {/* Prep Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-border-custom shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Total Items</p>
                    <h3 className="text-2xl font-black text-primary">{prepItems.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-border-custom shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Total Weight</p>
                    <h3 className="text-2xl font-black text-primary">{totalWeight} kg</h3>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-border-custom shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">In Progress</p>
                    <h3 className="text-2xl font-black text-primary">{totalOrders - readyOrders}</h3>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-border-custom shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Packed / Ready</p>
                    <h3 className="text-2xl font-black text-green-600">{readyOrders}</h3>
                </div>
            </div>

            {/* Prep Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prepItems.map((item) => {
                    const isFullyProcessed = item.processedCount === item.orderCount && item.orderCount > 0;

                    return (
                        <div
                            key={item.id}
                            className={cn(
                                "group bg-white rounded-[32px] border-2 p-6 transition-all duration-300 relative overflow-hidden",
                                isFullyProcessed ? "border-green-100 shadow-md" : "border-border-custom hover:border-primary/20"
                            )}
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                        isFullyProcessed ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"
                                    )}>
                                        <Fish size={24} />
                                    </div>
                                    <div>
                                        {/* <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{item.category}</p> */}
                                        <h4 className="text-lg font-black text-primary uppercase tracking-tight">{item.productName}</h4>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-md">
                                                <Package size={12} /> {item.quantity}{item.unit}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-md">
                                                <Clock size={12} /> {item.orderCount} Orders
                                            </div>
                                            {(item.subscriptionCount ?? 0) > 0 && (
                                                <div className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                                                    ↻ {item.subscriptionCount} Sub
                                                </div>
                                            )}
                                            {(item.oneTimeCount ?? 0) > 0 && (
                                                <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                                                    1x {item.oneTimeCount} One-off
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                        isFullyProcessed
                                            ? "bg-green-50 text-green-600 border-green-200"
                                            : "bg-background-soft text-text-muted border-border-custom"
                                    )}>
                                        {item.processedCount} / {item.orderCount} Ready
                                    </span>
                                    {isFullyProcessed && <CheckCircle2 size={24} className="text-green-500 transition-all scale-110" />}
                                </div>
                            </div>

                            {/* Progress bar for fully processed items */}
                            {isFullyProcessed && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />
                            )}
                        </div>
                    );
                })}
            </div>

        </div>
    )
}
