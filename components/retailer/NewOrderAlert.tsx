"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import socket from "@/data/api/socket"
import useAuthStore from "@/data/store/useAuthStore"
import apiClient from "@/data/api/apiClient"

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
    product: {
        _id: string
        name: string
    }
    quantity: number
    price: number
    weightLabel?: string
}

interface IncomingOrder {
    _id: string
    orderId: string
    totalAmount: number
    user?: {
        _id?: string
        fullName?: string
        phoneNumber?: string
        // fallback older fields
        name?: string
        phone?: string
    }
    items: OrderItem[]
    createdAt?: string
}

interface AlertEntry {
    id: string           // orderId (e.g. ORD-1234-5678)
    dbId: string         // _id (mongo)
    customerName: string
    products: { name: string; qty: number; weightLabel?: string }[]
    totalAmount: number
    accepting: boolean
}

// ─── Sound ────────────────────────────────────────────────────────────────────

function playAlertSound() {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioContext) return
        const ctx = new AudioContext()

        const beepSequence = [880, 1100, 880]
        let startTime = ctx.currentTime

        beepSequence.forEach((freq) => {
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)

            oscillator.type = "sine"
            oscillator.frequency.setValueAtTime(freq, startTime)

            gainNode.gain.setValueAtTime(0, startTime)
            gainNode.gain.linearRampToValueAtTime(0.6, startTime + 0.05)
            gainNode.gain.linearRampToValueAtTime(0, startTime + 0.22)

            oscillator.start(startTime)
            oscillator.stop(startTime + 0.25)

            startTime += 0.3
        })

        // Close context after sound finishes
        setTimeout(() => ctx.close(), 1200)
    } catch {
        // Silently fail if audio isn't available
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewOrderAlert() {
    const { user } = useAuthStore()
    const [alerts, setAlerts] = useState<AlertEntry[]>([])
    const seenOrderIds = useRef<Set<string>>(new Set())
    const [visible, setVisible] = useState(false)

    // ── Fetch existing pending orders on mount ────────────────────────────────

    useEffect(() => {
        if (!user) return

        const fetchPending = async () => {
            try {
                const res = await apiClient.get("/retailer/orders")
                const data = res.data?.data?.orders || []
                const pending = data.filter((o: any) => o.status === "Pending")
                
                if (pending.length > 0) {
                    const mapped: AlertEntry[] = pending.map((o: any) => {
                        const uniqueKey = o.id
                        seenOrderIds.current.add(uniqueKey)
                        return {
                            id: o.id,
                            dbId: o.dbId || o.id,
                            customerName: o.customerName || "Customer",
                            products: (o.items || []).map((i: any) => ({
                                name: i.name,
                                qty: i.quantity,
                                weightLabel: i.weightLabel
                            })),
                            totalAmount: parseFloat(o.price) || 0,
                            accepting: false
                        }
                    })
                    
                    setAlerts(mapped)
                    setVisible(true)
                    playAlertSound()
                }
            } catch (err) {
                console.error("Failed to fetch pending alerts", err)
            }
        }

        fetchPending()
    }, [user])

    // ── Connect & listen ──────────────────────────────────────────────────────

    useEffect(() => {
        if (!user?._id && !user?.id) return

        const userId = (user._id || user.id) as string
        const room = `retailer_${userId}`

        // Connect and join room
        if (!socket.connected) {
            socket.connect()
        } else {
            // If already connected, join immediately
            socket.emit("join", room)
        }

        const onConnect = () => {
            console.log("🟢 NewOrderAlert: Socket connected, joining room:", room)
            socket.emit("join", room)
        }
        
        socket.on("connect", onConnect)

        const handleOrderUpdate = (payload: { status: string; data: IncomingOrder; orderId?: string }) => {
            const { status, data } = payload

            // Only care about new Pending orders
            if (status !== "Pending" || !data) return

            // De-duplicate
            const uniqueKey = data.orderId || data._id
            if (seenOrderIds.current.has(uniqueKey)) return
            seenOrderIds.current.add(uniqueKey)

            // Build products list
            const products = (data.items || []).map((item) => ({
                name: item.product?.name || "Unknown Product",
                qty: item.quantity,
                weightLabel: item.weightLabel
            }))

            const entry: AlertEntry = {
                id: data.orderId,
                dbId: data._id,
                customerName: data.user?.fullName || data.user?.name || data.user?.phoneNumber || data.user?.phone || "Customer",
                products,
                totalAmount: data.totalAmount,
                accepting: false
            }

            setAlerts((prev) => [...prev, entry])
            setVisible(true)
            playAlertSound()
        }

        socket.on("orderUpdate", handleOrderUpdate)

        return () => {
            socket.off("connect", onConnect)
            socket.off("orderUpdate", handleOrderUpdate)
            socket.emit("leave", room)
        }
    }, [user])

    // ── Dismiss (popup only, no API) ──────────────────────────────────────────

    const dismiss = useCallback((id: string) => {
        setAlerts((prev) => {
            const next = prev.filter((a) => a.id !== id)
            if (next.length === 0) setVisible(false)
            return next
        })
    }, [])

    // ── Accept (calls update-order-status API) ────────────────────────────────

    const accept = useCallback(async (entry: AlertEntry) => {
        setAlerts((prev) =>
            prev.map((a) => a.id === entry.id ? { ...a, accepting: true } : a)
        )
        try {
            // Backend updateOrderItemStatus expects the orderId string (e.g. ORD-xxx), not the Mongo _id
            await apiClient.patch("/retailer/order-status", {
                orderId: entry.id,
                status: "Accepted"
            })
        } catch {
            // If it fails just dismiss – retailer can handle from orders page
        } finally {
            dismiss(entry.id)
        }
    }, [dismiss])

    // ── Dismiss all ───────────────────────────────────────────────────────────

    const dismissAll = useCallback(() => {
        setAlerts([])
        setVisible(false)
    }, [])

    if (!visible || alerts.length === 0) return null

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    zIndex: 9998,
                    animation: "noa-fade-in 0.25s ease"
                }}
                onClick={dismissAll}
            />

            {/* Modal */}
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 9999,
                    width: "min(92vw, 550px)",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    borderRadius: "20px",
                    background: "#ffffff",
                    border: "1px solid rgba(0,0,0,0.05)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                    animation: "noa-slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1)"
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: "20px 24px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {/* Pulsing dot */}
                        <div style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: "#6CC51D",
                            boxShadow: "0 0 0 0 rgba(108,197,29,0.4)",
                            animation: "noa-pulse 1.4s infinite"
                        }} />
                        <span style={{
                            fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#111",
                            letterSpacing: "-0.3px"
                        }}>
                            🦐 New Order{alerts.length > 1 ? `s (${alerts.length})` : ""}!
                        </span>
                    </div>
                    <button
                        onClick={dismissAll}
                        title="Dismiss all"
                        style={{
                            background: "#F4F5F9",
                            border: "none",
                            borderRadius: "8px",
                            color: "#666",
                            cursor: "pointer",
                            fontSize: "18px",
                            lineHeight: 1,
                            padding: "4px 8px",
                            transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#E5E7EB")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#F4F5F9")}
                    >
                        ✕
                    </button>
                </div>

                {/* Order Cards */}
                <div style={{ padding: "16px 24px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    {alerts.slice(0, 4).map((alert) => (
                        <div
                            key={alert.id}
                            style={{
                                background: "#F4F5F9",
                                border: "1px solid rgba(0,0,0,0.03)",
                                borderRadius: "14px",
                                padding: "16px 18px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                                animation: "noa-fade-in 0.3s ease"
                            }}
                        >
                            {/* Customer row */}
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{
                                    width: "36px", height: "36px", borderRadius: "50%",
                                    background: "linear-gradient(135deg, #6CC51D, #4a9614)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "15px", fontWeight: 700, color: "#fff",
                                    flexShrink: 0
                                }}>
                                    {alert.customerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#111" }}>
                                        {alert.customerName}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#666" }}>
                                        #{alert.id}
                                    </div>
                                </div>
                                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                                    <div style={{
                                        fontSize: "16px", fontWeight: 700,
                                        color: "#4a9614",
                                        fontVariantNumeric: "tabular-nums"
                                    }}>
                                        ₹{alert.totalAmount.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Products list */}
                            <div style={{
                                background: "#ffffff",
                                border: "1px solid #E5E7EB",
                                borderRadius: "8px",
                                padding: "10px 12px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px"
                            }}>
                                {alert.products.map((p, idx) => (
                                    <div key={idx} style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: "12px"
                                    }}>
                                        <span style={{ fontSize: "14px", color: "#333", fontWeight: 500 }}>
                                            🦐 {p.name}{p.weightLabel ? ` (${p.weightLabel})` : ""}
                                        </span>
                                        <span style={{
                                            fontSize: "12px", color: "#4a9614", fontWeight: 600,
                                            whiteSpace: "nowrap",
                                            background: "rgba(108,197,29,0.12)",
                                            borderRadius: "6px",
                                            padding: "2px 8px"
                                        }}>
                                            × {p.qty}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Action buttons */}
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    onClick={() => accept(alert)}
                                    disabled={alert.accepting}
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        borderRadius: "10px",
                                        border: "none",
                                        background: alert.accepting
                                            ? "rgba(108,197,29,0.3)"
                                            : "linear-gradient(135deg, #6CC51D, #4a9614)",
                                        color: "#fff",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        cursor: alert.accepting ? "not-allowed" : "pointer",
                                        transition: "all 0.2s",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "6px"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!alert.accepting) e.currentTarget.style.filter = "brightness(1.1)"
                                    }}
                                    onMouseLeave={(e) => { e.currentTarget.style.filter = "none" }}
                                >
                                    {alert.accepting ? (
                                        <>
                                            <span style={{
                                                width: "14px", height: "14px",
                                                border: "2px solid rgba(255,255,255,0.4)",
                                                borderTopColor: "#fff",
                                                borderRadius: "50%",
                                                display: "inline-block",
                                                animation: "noa-spin 0.7s linear infinite"
                                            }} />
                                            Accepting...
                                        </>
                                    ) : "✓ Accept Order"}
                                </button>

                                <button
                                    onClick={() => dismiss(alert.id)}
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        borderRadius: "10px",
                                        border: "1px solid #E5E7EB",
                                        background: "#ffffff",
                                        color: "#4b5563",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#F9FAFB"
                                        e.currentTarget.style.color = "#111"
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#ffffff"
                                        e.currentTarget.style.color = "#4b5563"
                                    }}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* +X more orders banner */}
                    {alerts.length > 4 && (
                        <div style={{
                            textAlign: "center",
                            padding: "12px",
                            background: "rgba(108,197,29,0.1)",
                            borderRadius: "10px",
                            color: "#4a9614",
                            fontWeight: 600,
                            fontSize: "14px",
                            marginTop: "4px"
                        }}>
                            +{alerts.length - 4} more order{alerts.length - 4 > 1 ? "s" : ""} waiting! Check your orders tab.
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                {alerts.length > 1 && (
                    <div style={{
                        padding: "0 24px 16px",
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#666"
                    }}>
                        Click outside or ✕ to dismiss all
                    </div>
                )}
            </div>

            {/* Injected keyframes */}
            <style>{`
                @keyframes noa-fade-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes noa-slide-up {
                    from { opacity: 0; transform: translate(-50%, calc(-50% + 24px)); }
                    to   { opacity: 1; transform: translate(-50%, -50%); }
                }
                @keyframes noa-pulse {
                    0%   { box-shadow: 0 0 0 0 rgba(108,197,29,0.7); }
                    70%  { box-shadow: 0 0 0 10px rgba(108,197,29,0); }
                    100% { box-shadow: 0 0 0 0 rgba(108,197,29,0); }
                }
                @keyframes noa-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    )
}
