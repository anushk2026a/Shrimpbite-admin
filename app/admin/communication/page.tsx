"use client"

import { useState } from "react"
import { BellRing, Mail, Send, Users, ShieldAlert, Sparkles, CheckCircle2, Layout, Smartphone, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"

export default function CommunicationHubPage() {
    const [sending, setSending] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)

    // FCM State
    const [fcmData, setFcmData] = useState({
        title: "",
        body: "",
        targetType: "all"
    })

    const [showConfirmModal, setShowConfirmModal] = useState(false)

    const handleSendFcm = (e: React.FormEvent) => {
        e.preventDefault()
        setShowConfirmModal(true)
    }

    const confirmAndDispatch = async () => {
        setShowConfirmModal(false)
        setSending(true)
        try {
            await adminService.sendBulkNotification(fcmData.title, fcmData.body, fcmData.targetType)
            setSuccess("Push notifications broadcasted successfully!")
            setFcmData({ title: "", body: "", targetType: "all" })
            setTimeout(() => setSuccess(null), 5000)
        } catch (error) {
            console.error("FCM broadcast failed:", error)
        } finally {
            setSending(false)
        }
    }

    const getTargetLabel = (type: string) => {
        switch (type) {
            case 'all': return 'All Shrimpbite Users';
            case 'retailer': return 'Retailers Only';
            case 'rider': return 'Delivery Riders Only';
            case 'customer': return 'Subscribed Customers Only';
            default: return type;
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Communication Hub</h1>
                <p className="text-text-muted mt-1">Broadcast high-impact updates and notifications to your entire user base.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[40px] border border-border-custom shadow-xl p-8 md:p-12 relative overflow-hidden">
                        {/* Status Message */}
                        {success && (
                            <div className="absolute top-0 left-0 right-0 bg-green-500 text-white py-3 px-8 flex items-center gap-3 animate-in slide-in-from-top duration-300 z-10">
                                <CheckCircle2 size={20} />
                                <p className="font-black text-xs uppercase tracking-widest">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleSendFcm} className="space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <BellRing size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-primary uppercase tracking-tight">Push Broadcast</h2>
                                        <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Real-time smartphone alerts</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Title</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g., Fresh Morning Catch is Here!"
                                            value={fcmData.title}
                                            onChange={e => setFcmData({ ...fcmData, title: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Target Audience</label>
                                        <select
                                            value={fcmData.targetType}
                                            onChange={e => setFcmData({ ...fcmData, targetType: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjcsIDQ1LCAzMSwgMC41KSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==')] bg-[length:20px] bg-[right_1.5rem_center] bg-no-repeat"
                                        >
                                            <option value="all">All Shrimpbite Users</option>
                                            <option value="retailer">Retailers Only</option>
                                            <option value="rider">Delivery Riders Only</option>
                                            <option value="customer">Subscribed Customers Only</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Message Body</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Write your alert message here..."
                                        value={fcmData.body}
                                        onChange={e => setFcmData({ ...fcmData, body: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-primary/20 outline-none transition-all font-medium resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={sending}
                                className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {sending ? "Broadcasting..." : <><Send size={20} /> Dispatch Push Notification</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar Context */}
                <div className="space-y-8">
                    {/* Live Preview (Mock) */}
                    <div className="bg-white rounded-[40px] border border-border-custom shadow-lg overflow-hidden flex flex-col items-center p-8">
                        <h3 className="text-xs font-black text-text-muted uppercase tracking-widest mb-6">Device Preview</h3>
                        <div className="w-[280px] h-[580px] border-[8px] border-zinc-900 rounded-[48px] bg-background-soft relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-10" />
                            <div className="p-4 mt-12">
                                {fcmData.title ? (
                                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/20 animate-in fade-in zoom-in duration-500">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-4 h-4 rounded-md bg-primary flex items-center justify-center">
                                                <img src="/loginlogo.png" className="w-3 h-3 invert" />
                                            </div>
                                            <span className="text-[10px] font-black text-primary uppercase tracking-tight">Shrimbite</span>
                                            <span className="text-[10px] text-text-muted ml-auto">Now</span>
                                        </div>
                                        <p className="text-xs font-bold text-primary truncate">{fcmData.title}</p>
                                        <p className="text-[10px] text-gray-600 line-clamp-2 mt-0.5 leading-snug">{fcmData.body || "Notification content preview will appear here..."}</p>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30 mt-20">
                                        <Layout size={40} className="text-text-muted mb-4" />
                                        <p className="text-xs font-bold text-text-muted text-center uppercase tracking-widest">Awaiting Content...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] border border-border-custom shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <ShieldAlert size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Confirm Broadcast</h2>
                                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Final review before dispatch</p>
                                </div>
                            </div>

                            <div className="space-y-6 bg-background-soft p-8 rounded-[32px] border border-border-custom/50">
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Notification Content</p>
                                    <h3 className="text-xl font-bold text-primary mb-1">{fcmData.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">{fcmData.body}</p>
                                </div>
                                <div className="pt-4 border-t border-border-custom flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Target Audience</p>
                                        <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {getTargetLabel(fcmData.targetType)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex items-start gap-4">
                                <ShieldAlert size={20} className="shrink-0 text-amber-600" />
                                <p className="text-xs font-bold text-amber-900 leading-relaxed uppercase tracking-tight">
                                    Broadcasts are irreversible. Please verify all content and target audiences before dispatching to avoid system-wide spam.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 py-4 bg-background-soft text-text-muted rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all"
                                >
                                    Cancel & Edit
                                </button>
                                <button
                                    onClick={confirmAndDispatch}
                                    className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    Confirm and Dispatch Notification <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
