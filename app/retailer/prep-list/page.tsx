"use client"

import { useState, useEffect } from "react"
import { Fish, Package, ChevronRight, CheckCircle2, AlertCircle, Clock, Printer, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import retailerService from "@/data/services/retailerService"
import socket from "@/data/api/socket"

interface PrepSummary {
    id: string;
    productName: string;
    category: string;
    quantity: number;
    totalWeight: number;
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
    totalWeight: number;
    weightLabel?: string;
    unit: string;
    status: string;
    frequency: string;
    customDays?: string[];
    isLastDelivery?: boolean;
    pauseMetrics?: {
        type: string;
        duration: string;
        resumeDate: string;
    } | null;
}

interface PrepData {
    summary: PrepSummary[];
    detailed: DetailedItem[];
}

import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"

export default function DailyPrepListPage() {
    const queryClient = useQueryClient()
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { data: prepData, isLoading, isFetching } = useQuery<PrepData>({
        queryKey: ["retailerPrepList", selectedDate.toDateString()],
        queryFn: async () => {
            const response = await retailerService.getPrepList(selectedDate.toISOString())
            return response.data || { summary: [], detailed: [] }
        },
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
    })

    const prepItems = prepData?.summary || []
    const detailedItems = prepData?.detailed || []

    const activeDetailedItems = detailedItems.filter(item => !item.status.includes("Paused") && !item.status.includes("Vacation"));
    const pausedDetailedItems = detailedItems.filter(item => item.status.includes("Paused") || item.status.includes("Vacation"));

    // Pagination Logic for Active Items
    const totalPages = Math.ceil(activeDetailedItems.length / itemsPerPage);
    const paginatedItems = activeDetailedItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination on date change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDate]);

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

    const totalWeight = prepItems.reduce((sum, item) => sum + (item.totalWeight || 0), 0).toFixed(1)
    const totalOrders = prepItems.reduce((sum, item) => sum + item.orderCount, 0)
    const readyOrders = prepItems.reduce((sum, item) => sum + item.processedCount, 0)

    const isToday = selectedDate.toDateString() === new Date().toDateString();
    const isFuture = selectedDate > new Date();

    const dateOptions = [
        { label: "Today", date: new Date() },
        { label: "Tomorrow", date: new Date(new Date().setDate(new Date().getDate() + 1)) },
        { label: "Day After", date: new Date(new Date().setDate(new Date().getDate() + 2)) },
    ];

    const isDataAvailable = !!prepData;
    const isActuallyLoading = isLoading && !isDataAvailable;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">
                        {isToday ? "Subscription Prep" : isFuture ? "Future Prep Prediction" : "Historical Prep"}
                    </h1>
                    <p className="text-text-muted mt-1 font-bold">
                        {isFuture
                            ? `Predicted inventory for ${selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`
                            : "Scheduled subscription orders requiring preparation for today."
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
                    <div className="relative">
                        <input
                            type="date"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            className="text-[10px] font-black uppercase text-primary bg-transparent outline-none cursor-pointer px-2"
                        />
                        {isFetching && (
                            <div className="absolute -top-1 -right-1">
                                <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Prep Summary Cards */}
            <div className={cn(
                "grid grid-cols-1 md:grid-cols-4 gap-6 transition-opacity",
                isFetching && !isLoading && "opacity-50"
            )}>
                {isActuallyLoading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-background-soft animate-pulse rounded-[32px]" />)
                ) : (
                    <>
                        <div className="bg-white p-7 rounded-[32px] border-2 border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 opacity-60">Total Subscriptions</p>
                            <h3 className="text-3xl font-black text-primary">{prepItems.length}</h3>
                        </div>
                        <div className="bg-white p-7 rounded-[32px] border-2 border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 opacity-60">Total Scheduled Weight</p>
                            <h3 className="text-3xl font-black text-primary">{totalWeight} <span className="text-sm">kg</span></h3>
                        </div>
                        <div className="bg-white p-7 rounded-[32px] border-2 border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 opacity-60">In Progress</p>
                            <h3 className="text-3xl font-black text-orange-600">{totalOrders - readyOrders}</h3>
                        </div>
                        <div className={cn(
                            "p-7 rounded-[32px] border-2 shadow-sm transition-all hover:scale-[1.02]",
                            readyOrders === totalOrders && totalOrders > 0 ? "bg-green-50 border-green-200" : "bg-white border-gray-100"
                        )}>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 opacity-60">Packed / Ready</p>
                            <h3 className={cn("text-3xl font-black", readyOrders === totalOrders && totalOrders > 0 ? "text-green-600" : "text-gray-400")}>
                                {readyOrders} / {totalOrders}
                            </h3>
                        </div>
                    </>
                )}
            </div>

            {/* Table View */}
            <div className="bg-white rounded-[40px] border-2 border-gray-100 shadow-sm overflow-hidden mb-20">
                <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-primary tracking-tight uppercase">Subscription Packing List</h3>
                        <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Daily scheduled fulfillments only</p>
                    </div>
                </div>

                <div className={cn(
                    "overflow-x-auto transition-opacity",
                    isFetching && !isLoading && "opacity-50"
                )}>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/30">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Order ID</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Product Details</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Frequency</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Quantity</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Status</th>
                            </tr>
                        </thead>
                        <tbody className={cn("divide-y divide-gray-50", isActuallyLoading && "animate-pulse")}>
                            {isActuallyLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-8 py-6 h-20 bg-background-soft/50" />
                                    </tr>
                                ))
                            ) : (
                                paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-text-muted">
                                            <Package size={48} className="opacity-10 mb-4" />
                                            <p className="font-bold text-sm text-gray-400">No scheduled subscriptions for this date.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((item) => (
                                    <tr key={item.id} className={cn(
                                        "group transition-all",
                                        (item.status.includes("Paused") || item.status.includes("Vacation") || item.status === "Cancelled")
                                            ? "opacity-75 bg-gray-50/80 saturate-50"
                                            : "hover:bg-gray-50/50"
                                    )}>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "font-black text-sm tracking-tighter uppercase",
                                                item.orderId === "WAITING-BILLING"
                                                    ? ((item.status.includes("Paused") || item.status.includes("Vacation") || item.status === "Cancelled") ? "text-amber-500/50" : "text-orange-500 italic")
                                                    : "text-primary"
                                            )}>
                                                {item.orderId === "WAITING-BILLING"
                                                    ? ((item.status.includes("Paused") || item.status.includes("Vacation") || item.status === "Cancelled") ? "—" : "PENDING")
                                                    : `#${item.orderId}`}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <Fish size={20} />
                                                </div>
                                                <span className="font-black text-primary/80 text-sm tracking-tight uppercase flex items-center gap-2">
                                                    {item.productName}
                                                    {item.weightLabel && (
                                                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                                            {item.weightLabel}
                                                        </span>
                                                    )}
                                                    {item.isLastDelivery && (
                                                        <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 flex items-center gap-1 animate-pulse">
                                                            🚩 FINAL DELIVERY
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[9px] font-black uppercase tracking-wider border border-green-100">
                                                    ↻ {item.frequency}
                                                </span>
                                                {item.frequency === "Weekly" && item.customDays && (
                                                    <span className="text-[8px] font-bold text-text-muted uppercase tracking-tighter text-wrap max-w-[100px]">
                                                        {item.customDays.join(", ")}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="font-black text-lg tracking-tighter text-primary">
                                                {item.totalWeight ?? item.quantity} <span className="text-[10px] opacity-60 ml-0.5">{item.unit}</span>
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                item.status === "Delivered" || item.status === "Completed"
                                                    ? "bg-green-50 text-green-600 border border-green-200"
                                                    : ["Accepted", "Processing", "Preparing", "Shipped", "Out for Delivery", "Rider Assigned", "Rider Accepted"].includes(item.status)
                                                        ? "bg-primary/5 text-primary border border-primary/20"
                                                        : (item.status.includes("Paused") || item.status.includes("Vacation") || item.status === "Cancelled")
                                                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                                                            : "bg-gray-50 text-gray-400 border border-gray-100"
                                            )}>
                                                {item.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                            Showing page {currentPage} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={cn(
                                    "p-2 rounded-xl border border-gray-200 transition-all",
                                    currentPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary hover:text-white bg-white shadow-sm"
                                )}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={cn(
                                    "p-2 rounded-xl border border-gray-200 transition-all",
                                    currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-primary hover:text-white bg-white shadow-sm"
                                )}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Second Table: Vacation & Paused Orders  */}
            {pausedDetailedItems.length > 0 && (
                <div className="bg-white rounded-[40px] border-2 border-amber-100/50 shadow-sm overflow-hidden mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <div className="p-8 border-b border-amber-50/50 bg-amber-50/30 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-amber-600 tracking-tight uppercase">Vacation & Paused Orders</h3>
                            <p className="text-xs text-amber-600/70 font-bold uppercase tracking-widest mt-1">Orders skipped for {isFuture ? "the selected date" : "today"}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-amber-50/10">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em]">Order ID</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em]">Product</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em]">Frequency</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em]">Quantity</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em]">Pause Type</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em]">Duration</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em]">Resume Date</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em]">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-50">
                                {pausedDetailedItems.map((item) => (
                                    <tr key={item.id} className="group transition-all opacity-80 bg-gray-50/50 saturate-50 hover:saturate-100 hover:opacity-100">
                                        <td className="px-8 py-6">
                                            <span className="font-black text-sm tracking-tighter uppercase text-amber-500/50">
                                                —
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                                                    <Fish size={20} />
                                                </div>
                                                <span className="font-black text-gray-700 text-sm tracking-tight uppercase flex items-center gap-2">
                                                    {item.productName}
                                                    {item.weightLabel && (
                                                        <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                            {item.weightLabel}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[9px] font-black uppercase tracking-wider border border-gray-200">
                                                ↻ {item.frequency}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="font-black text-lg tracking-tighter text-gray-600">
                                                {item.totalWeight ?? item.quantity} <span className="text-[10px] opacity-60 ml-0.5">{item.unit}</span>
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="font-bold text-xs text-gray-500 uppercase tracking-widest">
                                                {item.pauseMetrics?.type || "Unknown"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="font-bold text-xs text-gray-500 uppercase tracking-widest">
                                                {item.pauseMetrics?.duration || "-"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="font-black text-xs text-amber-600 uppercase tracking-widest">
                                                {item.pauseMetrics?.resumeDate || "-"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200">
                                                {item.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
