"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Bike, Power, MapPin, MoreVertical, Trash2 } from "lucide-react"
import retailerService from "@/data/services/retailerService"
import { toast } from "sonner"

export default function RidersPage() {
    const [riders, setRiders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        vehicleType: "Bike",
        plateNumber: ""
    })

    useEffect(() => {
        fetchRiders()
    }, [])

    const fetchRiders = async () => {
        try {
            setLoading(true)
            const response = await retailerService.getRiders()
            if (response.success) {
                setRiders(response.data)
            }
        } catch (error) {
            toast.error("Failed to fetch riders")
        } finally {
            setLoading(false)
        }
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await retailerService.addRider(formData)
            if (response.success) {
                toast.success("Rider added successfully")
                setShowAddModal(false)
                fetchRiders()
                setFormData({ name: "", email: "", password: "", phone: "", vehicleType: "Bike", plateNumber: "" })
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add rider")
        }
    }

    const toggleStatus = async (riderId: string, currentStatus: string) => {
        const newStatus = currentStatus === "Offline" ? "Available" : "Offline"
        try {
            const response = await retailerService.updateRiderStatus(riderId, newStatus)
            if (response.success) {
                setRiders(riders.map(r => r._id === riderId ? { ...r, status: newStatus } : r))
                toast.success(`Rider is now ${newStatus}`)
            }
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Riders Management</h1>
                    <p className="text-text-muted">Manage your delivery personnel and their status.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add New Rider
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-white border border-border-custom rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : riders.length === 0 ? (
                <div className="bg-white border border-border-custom rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="text-blue-600" size={32} />
                    </div>
                    <h3 className="text-lg font-bold mb-1">No riders added yet</h3>
                    <p className="text-text-muted mb-6">Create your first rider to start delivering orders.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="text-primary font-semibold hover:underline"
                    >
                        + Add a rider
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {riders.map((rider: any) => (
                        <div key={rider._id} className="bg-white border border-border-custom rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                                        <Users className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{rider.user?.name}</h3>
                                        <p className="text-xs text-text-muted">{rider.user?.email}</p>
                                    </div>
                                </div>
                                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${rider.status === 'Available' ? 'bg-green-100 text-green-700' :
                                    rider.status === 'On Delivery' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {rider.status}
                                </div>
                            </div>

                            <div className="space-y-2.5 mb-6">
                                <div className="flex items-center gap-3 text-sm text-text-muted">
                                    <Bike size={16} />
                                    <span>{rider.vehicleDetails?.vehicleType} • {rider.vehicleDetails?.plateNumber}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-text-muted">
                                    <MapPin size={16} />
                                    <span>Last synced: {new Date(rider.updatedAt).toLocaleTimeString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-border-custom">
                                <button
                                    onClick={() => toggleStatus(rider._id, rider.status)}
                                    className="flex-1 bg-background-soft hover:bg-primary-light hover:text-primary py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Power size={16} />
                                    {rider.status === 'Offline' ? 'Go Online' : 'Go Offline'}
                                </button>
                                <button className="p-2 border border-border-custom rounded-lg hover:bg-red-50 hover:text-destructive transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Rider Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-border-custom flex items-center justify-between">
                            <h2 className="text-xl font-bold">Add Delivery Rider</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-foreground">
                                <Plus className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold ml-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInput}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border-custom focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="Enter rider name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold ml-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInput}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border-custom focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold ml-1">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleInput}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border-custom focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleInput}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border-custom focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold ml-1">Vehicle Type</label>
                                    <select
                                        name="vehicleType"
                                        value={formData.vehicleType}
                                        onChange={handleInput}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border-custom focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    >
                                        <option value="Bike">Bike</option>
                                        <option value="Scooter">Scooter</option>
                                        <option value="Cycle">Cycle</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold ml-1">Plate Number</label>
                                    <input
                                        type="text"
                                        name="plateNumber"
                                        required
                                        value={formData.plateNumber}
                                        onChange={handleInput}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border-custom focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="KA 01 XX 0000"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-border-custom font-bold hover:bg-background-soft transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                >
                                    Create Rider
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
