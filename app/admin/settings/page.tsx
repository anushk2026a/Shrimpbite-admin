"use client"

import { useState, useEffect } from "react"
import { Save, Bell, Mail, Plus, X } from "lucide-react"
import { toast } from "sonner"
import apiClient from "@/data/api/apiClient"

export default function AdminSettingsPage() {
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    
    // Notification Settings
    const [emails, setEmails] = useState<string[]>([])
    const [newEmail, setNewEmail] = useState("")
    const [alerts, setAlerts] = useState({
        newOrder: true,
        orderDelayed: true,
        newCustomer: true
    })

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await apiClient.get("/admin/settings")
                const data = res.data?.data || {}
                
                if (data.ADMIN_NOTIFICATION_EMAILS) {
                    setEmails(data.ADMIN_NOTIFICATION_EMAILS)
                }
                
                setAlerts({
                    newOrder: data.NOTIFY_NEW_ORDER ?? true,
                    orderDelayed: data.NOTIFY_ORDER_DELAYED ?? true,
                    newCustomer: data.NOTIFY_NEW_CUSTOMER ?? true
                })
            } catch (error) {
                console.error("Failed to load settings:", error)
                toast.error("Failed to load settings")
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const handleAddEmail = () => {
        if (!newEmail || !newEmail.includes("@")) {
            toast.error("Please enter a valid email")
            return
        }
        if (emails.includes(newEmail)) {
            toast.error("Email already added")
            return
        }
        setEmails([...emails, newEmail.toLowerCase()])
        setNewEmail("")
    }

    const handleRemoveEmail = (index: number) => {
        setEmails(emails.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await apiClient.post("/admin/settings", {
                ADMIN_NOTIFICATION_EMAILS: emails,
                NOTIFY_NEW_ORDER: alerts.newOrder,
                NOTIFY_ORDER_DELAYED: alerts.orderDelayed,
                NOTIFY_NEW_CUSTOMER: alerts.newCustomer
            })
            toast.success("Settings saved successfully!")
        } catch (error) {
            console.error(error)
            toast.error("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-gray-500 mt-1">Manage global platform configurations and alerts.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? "Saving..." : "Save Settings"}
                </button>
            </div>

            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Email Notifications</h2>
                        <p className="text-sm text-gray-500">Configure who receives system alerts</p>
                    </div>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Add Emails */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700">Admin Alert Emails</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1 max-w-md">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                                    placeholder="Enter email address..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <button
                                onClick={handleAddEmail}
                                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Plus size={18} /> Add
                            </button>
                        </div>
                        
                        {/* Email Tags */}
                        {emails.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {emails.map((email, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100">
                                        {email}
                                        <button onClick={() => handleRemoveEmail(idx)} className="hover:bg-blue-200 p-0.5 rounded-full transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 mt-2 italic">No emails configured. Alerts will not be sent.</p>
                        )}
                    </div>

                    <hr className="border-gray-100" />

                    {/* Alert Triggers */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-gray-700">Send Alerts For</label>
                        
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={alerts.newOrder}
                                onChange={(e) => setAlerts({...alerts, newOrder: e.target.checked})}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div>
                                <p className="font-medium text-gray-900 group-hover:text-primary transition-colors">New Orders</p>
                                <p className="text-sm text-gray-500">When a customer successfully places a new order.</p>
                            </div>
                        </label>
                        
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={alerts.orderDelayed}
                                onChange={(e) => setAlerts({...alerts, orderDelayed: e.target.checked})}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div>
                                <p className="font-medium text-gray-900 group-hover:text-primary transition-colors">Order Delays</p>
                                <p className="text-sm text-gray-500">When an order exceeds the expected preparation or delivery time.</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={alerts.newCustomer}
                                onChange={(e) => setAlerts({...alerts, newCustomer: e.target.checked})}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div>
                                <p className="font-medium text-gray-900 group-hover:text-primary transition-colors">New Customer Registration</p>
                                <p className="text-sm text-gray-500">When a new user signs up on the Shrimpbite platform.</p>
                            </div>
                        </label>
                    </div>
                </div>
            </section>
        </div>
    )
}
