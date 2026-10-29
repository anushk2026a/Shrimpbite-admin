"use client"

import { useEffect, useRef, useState } from "react"
import socket from "@/data/api/socket"
import useAuthStore from "@/data/store/useAuthStore"

// ─── Sound Unlock Banner ──────────────────────────────────────────────────────
export function AdminSoundUnlockBanner() {
    const [unlocked, setUnlocked] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        if (sessionStorage.getItem("shrimpbite_audio_unlocked")) setUnlocked(true)
    }, [])

    const unlock = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext
            if (AudioContext) {
                const ctx = new AudioContext()
                const buf = ctx.createBuffer(1, 1, 22050)
                const src = ctx.createBufferSource()
                src.buffer = buf
                src.connect(ctx.destination)
                src.start(0)
                setTimeout(() => ctx.close(), 500)
            }
        } catch {}
        sessionStorage.setItem("shrimpbite_audio_unlocked", "1")
        setUnlocked(true)
    }

    if (unlocked || dismissed) return null

    return (
        <div style={{
            position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)",
            zIndex: 99997, background: "#1e293b", color: "#fff",
            padding: "10px 20px", borderRadius: "12px",
            display: "flex", alignItems: "center", gap: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)", fontSize: "13px", fontWeight: 600
        }}>
            <span>🔔 Enable order alert sounds</span>
            <button
                onClick={unlock}
                style={{
                    background: "#3B82F6", color: "#fff", border: "none",
                    padding: "6px 14px", borderRadius: "8px", cursor: "pointer",
                    fontWeight: 700, fontSize: "13px"
                }}
            >Enable</button>
            <button
                onClick={() => setDismissed(true)}
                style={{
                    background: "transparent", color: "#94a3b8", border: "none",
                    cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "0 4px"
                }}
            >×</button>
        </div>
    )
}

// ─── Sound ────────────────────────────────────────────────────────────────────
function playAlertSound() {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioContext) return
        const ctx = new AudioContext()

        // Distinct admin alert sound (slightly higher pitched than retailer)
        const beepSequence = [1000, 1300, 1000]
        let startTime = ctx.currentTime

        beepSequence.forEach((freq) => {
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)

            oscillator.type = "sine"
            oscillator.frequency.setValueAtTime(freq, startTime)

            gainNode.gain.setValueAtTime(0, startTime)
            gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.05)
            gainNode.gain.linearRampToValueAtTime(0, startTime + 0.22)

            oscillator.start(startTime)
            oscillator.stop(startTime + 0.25)

            startTime += 0.3
        })

        setTimeout(() => ctx.close(), 1200)
    } catch {
        // Silently fail if audio isn't available
    }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NewAdminOrderAlert() {
    const { user } = useAuthStore()
    const [alerts, setAlerts] = useState<any[]>([])
    const seenOrderIds = useRef<Set<string>>(new Set())

    useEffect(() => {
        if (!user || user.role !== "admin") return

        const onConnect = () => {
            socket.emit("joinAdmin")
        }

        const handleOrderUpdate = (payload: any) => {
            if (!payload || payload.status !== "Pending") return
            
            const o = payload.data
            if (!o) return
            
            const orderId = o.orderId || o.id || o._id
            if (!orderId || seenOrderIds.current.has(orderId)) return

            seenOrderIds.current.add(orderId)

            setAlerts(prev => {
                const updated = [...prev, {
                    id: orderId,
                    customerName: o.user?.fullName || o.user?.name || "Customer",
                    retailerName: o.retailer?.businessDetails?.businessName || o.retailer?.name || "Retailer",
                    totalAmount: parseFloat(o.totalAmount || o.price) || 0,
                }]
                if (updated.length === 1) {
                    playAlertSound()
                } else if (updated.length > prev.length) {
                    playAlertSound()
                }
                return updated
            })
        }

        socket.on("connect", onConnect)
        socket.on("orderUpdate", handleOrderUpdate)

        if (socket.connected) {
            onConnect()
        }

        return () => {
            socket.off("connect", onConnect)
            socket.off("orderUpdate", handleOrderUpdate)
        }
    }, [user])

    const dismiss = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id))
    }

    const dismissAll = () => {
        setAlerts([])
    }

    if (alerts.length === 0) return null

    return (
        <>
            <div 
                style={{
                    position: "fixed", inset: 0, zIndex: 99998,
                    background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
                    animation: "noa-fade-in 0.3s ease forwards"
                }}
                onClick={dismissAll}
            />

            <div style={{
                position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                zIndex: 99999, width: "90%", maxWidth: "400px",
                maxHeight: "90vh", display: "flex", flexDirection: "column",
                animation: "noa-slide-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
            }}>
                <div style={{
                    background: "#ffffff", borderRadius: "16px", padding: "8px",
                    overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}>
                    {alerts.slice(0, 4).map((alert) => (
                        <div key={alert.id} style={{
                            background: "#F8FAFC", borderRadius: "12px", padding: "16px",
                            display: "flex", flexDirection: "column", gap: "12px",
                            border: "2px solid #3B82F6", animation: "noa-pulse 2s infinite"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b", fontWeight: 800 }}>New Order Alert</h3>
                                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b", fontWeight: 600 }}>Order #{alert.id.slice(-6).toUpperCase()}</p>
                                </div>
                                <div style={{
                                    background: "#3B82F6", color: "#fff", padding: "4px 10px",
                                    borderRadius: "8px", fontSize: "14px", fontWeight: 700
                                }}>
                                    ₹{alert.totalAmount.toFixed(2)}
                                </div>
                            </div>
                            
                            <div style={{ background: "#ffffff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "10px 12px" }}>
                                <p style={{ margin: 0, fontSize: "14px", color: "#333", fontWeight: 500 }}>
                                    Customer: <b>{alert.customerName}</b>
                                </p>
                                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#333", fontWeight: 500 }}>
                                    Shop: <b>{alert.retailerName}</b>
                                </p>
                            </div>

                            <button
                                onClick={() => dismiss(alert.id)}
                                style={{
                                    width: "100%", padding: "10px", borderRadius: "10px",
                                    background: "#3B82F6", color: "#fff", fontSize: "14px",
                                    fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.2s"
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)" }}
                                onMouseLeave={(e) => { e.currentTarget.style.filter = "none" }}
                            >
                                Dismiss Alert
                            </button>
                        </div>
                    ))}
                    {alerts.length > 4 && (
                        <div style={{ textAlign: "center", padding: "12px", background: "rgba(59,130,246,0.1)", borderRadius: "10px", color: "#3B82F6", fontWeight: 600, fontSize: "14px", marginTop: "4px" }}>
                            +{alerts.length - 4} more new orders waiting!
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes noa-fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes noa-slide-up { from { opacity: 0; transform: translate(-50%, calc(-50% + 24px)); } to { opacity: 1; transform: translate(-50%, -50%); } }
                @keyframes noa-pulse { 0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.7); } 70% { box-shadow: 0 0 0 10px rgba(59,130,246,0); } 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); } }
            `}</style>
        </>
    )
}
