"use client"

import { useState, useEffect } from "react"
import {
    Users,
    UserPlus,
    Search,
    Phone,
    MapPin,
    TrendingUp,
    ShoppingCart,
    Printer,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    Trash2,
    RefreshCw,
    X,
    Calendar,
    CreditCard,
    Pencil
} from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import { cn } from "@/lib/utils"
import apiClient from "@/data/api/apiClient"
import retailerService from "@/data/services/retailerService"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export default function RetailerCustomersPage() {
    const queryClient = useQueryClient()
    const [mounted, setMounted] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [showHistoryModal, setShowHistoryModal] = useState(false)

    // Modal States
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
    const [showPosOrderModal, setShowPosOrderModal] = useState(false)
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)
    const [currentInvoice, setCurrentInvoice] = useState<any>(null)

    // Add Customer Form
    const [newCustomer, setNewCustomer] = useState({
        fullName: "",
        phoneNumber: "",
        email: "",
        address: "",
        city: "Bangalore",
        state: "Karnataka",
        pincode: ""
    })
    const [addingCustomer, setAddingCustomer] = useState(false)
    const [customerError, setCustomerError] = useState("")

    // Edit Customer Form
    const [showEditCustomerModal, setShowEditCustomerModal] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<any>(null)
    const [editCustomerData, setEditCustomerData] = useState({
        fullName: "",
        phoneNumber: "",
        email: "",
        address: "",
        city: "Bangalore",
        state: "Karnataka",
        pincode: ""
    })
    const [savingEditCustomer, setSavingEditCustomer] = useState(false)
    const [editCustomerError, setEditCustomerError] = useState("")

    // POS Order Form
    const [posOrderType, setPosOrderType] = useState<"One-time" | "Subscription">("One-time")
    const [posFrequency, setPosFrequency] = useState<"Daily" | "Alternate Days" | "Weekly">("Daily")
    const [posPaymentType, setPosPaymentType] = useState<"Paid" | "Dues">("Paid")
    const [posPaymentMethod, setPosPaymentMethod] = useState<"Cash" | "UPI" | "POS_Dues">("Cash")
    const [selectedItems, setSelectedItems] = useState<Array<{
        productId: string
        name: string
        variantId?: string
        weightLabel: string
        price: number
        quantity: number
    }>>([])
    const [creatingOrder, setCreatingOrder] = useState(false)
    const [orderError, setOrderError] = useState("")

    // Fetch Retailer Products for POS selector
    const { data: productsData } = useQuery({
        queryKey: ["retailerProducts"],
        queryFn: async () => {
            const res = await apiClient.get("/retailer/products")
            return res.data?.products || res.data?.data || []
        },
        staleTime: 5 * 60 * 1000,
    })

    // Fetch Customers Directory
    const { data: customersData, isLoading: loading, refetch: refetchCustomers } = useQuery({
        queryKey: ["retailerCustomers"],
        queryFn: async () => {
            const res = await retailerService.getCustomers()
            return res.data
        },
        staleTime: 5 * 60 * 1000,
    })

    // Fetch Specific Customer's Order History
    const { data: customerOrders = [], isLoading: historyLoading } = useQuery({
        queryKey: ["customerOrders", selectedCustomer?.id],
        queryFn: async () => {
            if (!selectedCustomer?.id) return []
            const res = await retailerService.getOrders(selectedCustomer.id)
            return res.data?.orders || []
        },
        enabled: showHistoryModal && !!selectedCustomer?.id,
        staleTime: 5 * 60 * 1000,
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (customersData?.customers && customersData.customers.length > 0 && !selectedCustomer) {
            setSelectedCustomer(customersData.customers[0])
        }
    }, [customersData, selectedCustomer])

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault()
        setCustomerError("")
        if (!newCustomer.fullName || !newCustomer.phoneNumber) {
            setCustomerError("Customer name and phone number are required.")
            return
        }

        setAddingCustomer(true)
        try {
            const res = await apiClient.post("/retailer/customers", newCustomer)
            if (res.data?.success) {
                setShowAddCustomerModal(false)
                setNewCustomer({
                    fullName: "",
                    phoneNumber: "",
                    email: "",
                    address: "",
                    city: "Bangalore",
                    state: "Karnataka",
                    pincode: ""
                })
                await refetchCustomers()
                queryClient.invalidateQueries({ queryKey: ["retailerCustomers"] })
            }
        } catch (err: any) {
            setCustomerError(err?.response?.data?.message || err.message || "Failed to add customer")
        } finally {
            setAddingCustomer(false)
        }
    }

    const openEditCustomerModal = (customer: any) => {
        setEditingCustomer(customer)
        setEditCustomerError("")
        const primaryAddr = customer.addresses?.[0] || customer.address || ""
        const addrStr = typeof primaryAddr === 'string' ? primaryAddr : (primaryAddr.fullAddress || "")
        setEditCustomerData({
            fullName: customer.name || customer.fullName || "",
            phoneNumber: (customer.phone || customer.phoneNumber || "").replace(/^\+91/, ""),
            email: customer.email && customer.email !== "N/A" ? customer.email : "",
            address: addrStr,
            city: typeof primaryAddr === 'object' && primaryAddr?.city ? primaryAddr.city : "Bangalore",
            state: typeof primaryAddr === 'object' && primaryAddr?.state ? primaryAddr.state : "Karnataka",
            pincode: typeof primaryAddr === 'object' && primaryAddr?.pincode ? primaryAddr.pincode : ""
        })
        setShowEditCustomerModal(true)
    }

    const handleUpdateCustomer = async (e: React.FormEvent) => {
        e.preventDefault()
        setEditCustomerError("")
        if (!editCustomerData.fullName || !editCustomerData.phoneNumber) {
            setEditCustomerError("Customer name and phone number are required.")
            return
        }

        setSavingEditCustomer(true)
        try {
            const custId = editingCustomer?.id || editingCustomer?._id
            const res = await apiClient.put(`/retailer/customers/${custId}`, editCustomerData)
            if (res.data?.success) {
                setShowEditCustomerModal(false)
                setEditingCustomer(null)
                await refetchCustomers()
                queryClient.invalidateQueries({ queryKey: ["retailerCustomers"] })
            }
        } catch (err: any) {
            setEditCustomerError(err?.response?.data?.message || err.message || "Failed to update customer")
        } finally {
            setSavingEditCustomer(false)
        }
    }

    const addItemToPos = (product: any) => {
        const variant = product.variants && product.variants.length > 0 ? product.variants[0] : null
        const price = variant ? variant.price : product.price
        const weightLabel = variant ? variant.weight : `${product.stock || 1} kg`

        const existingIndex = selectedItems.findIndex(i => i.productId === product._id && i.variantId === (variant?._id || undefined))
        if (existingIndex > -1) {
            const updated = [...selectedItems]
            updated[existingIndex].quantity += 1
            setSelectedItems(updated)
        } else {
            setSelectedItems([...selectedItems, {
                productId: product._id,
                name: product.name,
                variantId: variant?._id,
                weightLabel,
                price,
                quantity: 1
            }])
        }
    }

    const updateItemQuantity = (index: number, qty: number) => {
        if (qty <= 0) {
            setSelectedItems(selectedItems.filter((_, i) => i !== index))
        } else {
            const updated = [...selectedItems]
            updated[index].quantity = qty
            setSelectedItems(updated)
        }
    }

    const posSubtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const handleCreatePosOrder = async () => {
        if (!selectedCustomer) return
        if (selectedItems.length === 0) {
            setOrderError("Please add at least one item to the order.")
            return
        }

        setCreatingOrder(true)
        setOrderError("")
        try {
            const payload = {
                customerId: selectedCustomer.id,
                items: selectedItems,
                orderType: posOrderType,
                subscriptionFrequency: posFrequency,
                posPaymentType,
                paymentMethod: posPaymentType === "Dues" ? "POS_Dues" : posPaymentMethod
            }

            const res = await apiClient.post("/retailer/pos-order", payload)
            if (res.data?.success) {
                const orderData = res.data.data.order
                setShowPosOrderModal(false)
                setSelectedItems([])

                // Load invoice for print preview
                fetchAndShowInvoice(orderData.orderId)
                queryClient.invalidateQueries({ queryKey: ["retailerCustomers"] })
                queryClient.invalidateQueries({ queryKey: ["customerOrders"] })
            }
        } catch (err: any) {
            setOrderError(err?.response?.data?.message || err.message || "Failed to create order")
        } finally {
            setCreatingOrder(false)
        }
    }

    const fetchAndShowInvoice = async (orderId: string) => {
        try {
            const res = await apiClient.get(`/retailer/pos-order/${orderId}/invoice`)
            if (res.data?.success) {
                setCurrentInvoice(res.data.data)
                setShowInvoiceModal(true)
            }
        } catch (err) {
            console.error("Failed to fetch invoice:", err)
        }
    }

    const printInvoice = () => {
        window.print()
    }

    if (!mounted || loading || !customersData) {
        return (
            <div className="space-y-6 animate-pulse p-4">
                <div className="h-12 bg-background-soft rounded-xl w-1/4" />
                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-background-soft rounded-2xl" />)}
                </div>
                <div className="h-80 bg-background-soft rounded-2xl" />
            </div>
        )
    }

    const stats = [
        { title: "My Total Customers", value: customersData.stats.totalCustomers.toLocaleString(), icon: Users, color: "bg-primary/10 text-primary" },
        { title: "New Customers", value: customersData.stats.newCustomers.toLocaleString(), icon: UserPlus, color: "bg-blue-50 text-blue-600" },
        { title: "Repeat Customers", value: customersData.stats.repeatPercentage, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
    ]

    const filteredCustomers = customersData.customers.filter((c: any) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Store Customers & POS</h1>
                    <p className="text-sm text-text-muted mt-0.5">
                        Manage your customer base, register walk-in buyers, create One-time / Subscription orders with Paid/Dues, and print bills.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddCustomerModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition shadow-sm"
                    >
                        <UserPlus size={18} /> Add New Customer
                    </button>
                </div>
            </div>

            {/* Metrics & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-5 rounded-2xl border border-border-custom shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                            <div className={cn("p-3 rounded-xl", stat.color)}>
                                <stat.icon size={22} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border-custom shadow-sm overflow-hidden min-h-[260px]">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Customer Acquisition (Last 7 Days)</h3>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={customersData.chartData}>
                                <defs>
                                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6CC51D" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6CC51D" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#868889" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#868889" }} />
                                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                                <Area type="monotone" dataKey="customers" stroke="#6CC51D" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Customers Table + Action Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-border-custom flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">Customer Directory</h3>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-1.5 rounded-xl bg-background-soft border-transparent text-sm outline-none w-64 focus:bg-white focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1 min-h-[400px]">
                        <table className="w-full text-left">
                            <thead className="bg-primary/5 text-xs font-bold text-primary uppercase sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="px-5 py-4">Customer</th>
                                    <th className="px-5 py-4">Contact</th>
                                    <th className="px-5 py-4">Orders</th>
                                    <th className="px-5 py-4">Total Spent</th>
                                    <th className="px-5 py-4">Category</th>
                                    <th className="px-5 py-4 text-center">POS Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-custom text-sm">
                                {filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                            No customers found matching &quot;{searchQuery}&quot;
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map((c: any) => (
                                        <tr
                                            key={c.id}
                                            onClick={() => setSelectedCustomer(c)}
                                            className={cn(
                                                "hover:bg-background-soft cursor-pointer transition-colors",
                                                selectedCustomer?.id === c.id && "bg-background-soft/60"
                                            )}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full overflow-hidden border bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                                        {c.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 block">{c.name}</span>
                                                        {c.isManualCustomer && (
                                                            <span className="text-[10px] font-semibold text-primary uppercase">Manual Walk-in</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 font-medium text-text-muted">{c.phone}</td>

                                            <td className="px-5 py-4">
                                                <span className="font-bold text-gray-900">{c.orderCount} Orders</span>
                                            </td>

                                            <td className="px-5 py-4 font-bold text-primary">₹{c.spend}</td>

                                            <td className="px-5 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-block",
                                                    c.status === "VIP" ? "bg-purple-100 text-purple-700" :
                                                    c.status === "New" ? "bg-blue-100 text-blue-700" :
                                                    "bg-emerald-100 text-emerald-700"
                                                )}>
                                                    {c.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            openEditCustomerModal(c)
                                                        }}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition"
                                                        title="Edit Customer"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setSelectedCustomer(c)
                                                            setShowPosOrderModal(true)
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition"
                                                    >
                                                        <ShoppingCart size={13} /> POS Order
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Selected Customer Card & Action Panel */}
                {selectedCustomer ? (
                    <div className="bg-white rounded-2xl border border-border-custom shadow-sm p-6 space-y-6 h-fit sticky top-6">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 overflow-hidden mx-auto mb-3 border-2 border-primary/20 flex items-center justify-center font-bold text-primary text-xl">
                                {selectedCustomer.name.slice(0, 2).toUpperCase()}
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">{selectedCustomer.name}</h3>
                            <p className="text-xs text-text-muted flex items-center justify-center gap-1 mt-1">
                                <Phone size={12} /> {selectedCustomer.phone}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-custom">
                            <div className="bg-background-soft p-3 rounded-xl border border-border-custom/50">
                                <p className="text-[10px] text-text-muted uppercase font-bold mb-1">Total Orders</p>
                                <p className="text-lg font-bold text-gray-900">{selectedCustomer.orderCount}</p>
                            </div>
                            <div className="bg-background-soft p-3 rounded-xl border border-border-custom/50">
                                <p className="text-[10px] text-text-muted uppercase font-bold mb-1">Total Spent</p>
                                <p className="text-lg font-bold text-primary">₹{selectedCustomer.spend}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={() => setShowPosOrderModal(true)}
                                className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 transition flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={16} /> Create POS Order
                            </button>

                            <button
                                onClick={() => openEditCustomerModal(selectedCustomer)}
                                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-border-custom"
                            >
                                <Pencil size={14} /> Edit Customer Details
                            </button>

                            <button
                                onClick={() => setShowHistoryModal(true)}
                                className="w-full py-2.5 bg-background-soft text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-border-custom"
                            >
                                <TrendingUp size={14} /> View Order History
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-border-custom shadow-sm p-6 flex flex-col items-center justify-center text-center h-[300px] text-text-muted">
                        <Users size={40} className="mb-3 opacity-20" />
                        <p className="text-sm">Select a customer to initiate orders</p>
                    </div>
                )}
            </div>

            {/* Modal 1: Add New Customer */}
            {showAddCustomerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-border-custom">
                        <div className="flex items-center justify-between pb-4 border-b border-border-custom">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Add Customer</h3>
                                <p className="text-xs text-text-muted">Register an offline or walk-in customer.</p>
                            </div>
                            <button onClick={() => setShowAddCustomerModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        {customerError && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                                {customerError}
                            </div>
                        )}

                        <form onSubmit={handleAddCustomer} className="mt-5 space-y-3.5">
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase">Customer Full Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Ramesh Kumar"
                                    value={newCustomer.fullName}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, fullName: e.target.value })}
                                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase">Phone Number *</label>
                                <input
                                    type="tel"
                                    placeholder="e.g. 9876543210"
                                    value={newCustomer.phoneNumber}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
                                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase">Email (Optional)</label>
                                <input
                                    type="email"
                                    placeholder="customer@email.com"
                                    value={newCustomer.email}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase">Street Address</label>
                                <textarea
                                    placeholder="Flat No, Building, Area"
                                    rows={2}
                                    value={newCustomer.address}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 uppercase">City</label>
                                    <input
                                        type="text"
                                        value={newCustomer.city}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                                        className="mt-1 w-full px-3.5 py-2 rounded-xl border bg-background-soft text-sm outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 uppercase">Pincode</label>
                                    <input
                                        type="text"
                                        placeholder="560001"
                                        value={newCustomer.pincode}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, pincode: e.target.value })}
                                        className="mt-1 w-full px-3.5 py-2 rounded-xl border bg-background-soft text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-3 flex justify-end gap-3 border-t border-border-custom">
                                <button
                                    type="button"
                                    onClick={() => setShowAddCustomerModal(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold border text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addingCustomer}
                                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50"
                                >
                                    {addingCustomer ? "Saving..." : "Save Customer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit Existing Customer */}
            {showEditCustomerModal && editingCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-border-custom">
                        <div className="flex items-center justify-between pb-4 border-b border-border-custom">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Edit Customer Profile</h3>
                                <p className="text-xs text-text-muted">Update customer contact or address details.</p>
                            </div>
                            <button onClick={() => setShowEditCustomerModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        {editCustomerError && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                                {editCustomerError}
                            </div>
                        )}

                        <form onSubmit={handleUpdateCustomer} className="mt-5 space-y-3.5">
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase">Customer Full Name *</label>
                                <input
                                    type="text"
                                    value={editCustomerData.fullName}
                                    onChange={(e) => setEditCustomerData({ ...editCustomerData, fullName: e.target.value })}
                                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase">Phone Number *</label>
                                <input
                                    type="tel"
                                    value={editCustomerData.phoneNumber}
                                    onChange={(e) => setEditCustomerData({ ...editCustomerData, phoneNumber: e.target.value })}
                                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase">Email (Optional)</label>
                                <input
                                    type="email"
                                    value={editCustomerData.email}
                                    onChange={(e) => setEditCustomerData({ ...editCustomerData, email: e.target.value })}
                                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase">Street Address</label>
                                <textarea
                                    rows={2}
                                    value={editCustomerData.address}
                                    onChange={(e) => setEditCustomerData({ ...editCustomerData, address: e.target.value })}
                                    className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-background-soft text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 uppercase">City</label>
                                    <input
                                        type="text"
                                        value={editCustomerData.city}
                                        onChange={(e) => setEditCustomerData({ ...editCustomerData, city: e.target.value })}
                                        className="mt-1 w-full px-3.5 py-2 rounded-xl border bg-background-soft text-sm outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 uppercase">Pincode</label>
                                    <input
                                        type="text"
                                        value={editCustomerData.pincode}
                                        onChange={(e) => setEditCustomerData({ ...editCustomerData, pincode: e.target.value })}
                                        className="mt-1 w-full px-3.5 py-2 rounded-xl border bg-background-soft text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-3 flex justify-end gap-3 border-t border-border-custom">
                                <button
                                    type="button"
                                    onClick={() => setShowEditCustomerModal(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold border text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingEditCustomer}
                                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50"
                                >
                                    {savingEditCustomer ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 2: Create POS Order (One-Time / Subscription & Paid / Dues) */}
            {showPosOrderModal && selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-border-custom max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-border-custom">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Initiate POS Order</h3>
                                <p className="text-xs text-text-muted">
                                    Customer: <span className="font-bold text-gray-800">{selectedCustomer.name}</span> ({selectedCustomer.phone})
                                </p>
                            </div>
                            <button onClick={() => setShowPosOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        {orderError && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                                {orderError}
                            </div>
                        )}

                        <div className="mt-5 space-y-5">
                            {/* Order Type Toggle */}
                            <div className="grid grid-cols-2 gap-3 p-1.5 bg-background-soft rounded-xl border border-border-custom">
                                <button
                                    type="button"
                                    onClick={() => setPosOrderType("One-time")}
                                    className={cn(
                                        "py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5",
                                        posOrderType === "One-time" ? "bg-white text-primary shadow-sm" : "text-gray-600"
                                    )}
                                >
                                    <ShoppingCart size={14} /> One-Time Order
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPosOrderType("Subscription")}
                                    className={cn(
                                        "py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5",
                                        posOrderType === "Subscription" ? "bg-white text-primary shadow-sm" : "text-gray-600"
                                    )}
                                >
                                    <Calendar size={14} /> Subscription Order
                                </button>
                            </div>

                            {/* Subscription Frequency (if Subscription) */}
                            {posOrderType === "Subscription" && (
                                <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
                                    <label className="text-xs font-bold text-primary uppercase">Delivery Frequency</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(["Daily", "Alternate Days", "Weekly"] as const).map((freq) => (
                                            <button
                                                key={freq}
                                                type="button"
                                                onClick={() => setPosFrequency(freq)}
                                                className={cn(
                                                    "py-1.5 text-xs font-bold rounded-lg border transition",
                                                    posFrequency === freq ? "bg-primary text-white border-primary" : "bg-white text-gray-700 border-gray-200"
                                                )}
                                            >
                                                {freq}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Product Selector */}
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase block mb-1.5">Select Products to Add</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 border rounded-xl bg-background-soft">
                                    {productsData && productsData.length > 0 ? (
                                        productsData.map((prod: any) => (
                                            <div
                                                key={prod._id}
                                                onClick={() => addItemToPos(prod)}
                                                className="p-2.5 bg-white rounded-lg border border-border-custom hover:border-primary cursor-pointer flex items-center justify-between text-xs transition"
                                            >
                                                <div className="truncate pr-2">
                                                    <p className="font-bold text-gray-900 truncate">{prod.name}</p>
                                                    <p className="text-text-muted">₹{prod.price} {prod.variants?.length ? `(${prod.variants.length} cuts)` : ""}</p>
                                                </div>
                                                <span className="p-1.5 rounded-lg bg-primary/10 text-primary font-bold">
                                                    <Plus size={14} />
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="p-4 text-xs text-text-muted col-span-2 text-center">No products found in store catalog.</p>
                                    )}
                                </div>
                            </div>

                            {/* Selected Items List */}
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase block mb-1.5">Selected Items ({selectedItems.length})</label>
                                {selectedItems.length === 0 ? (
                                    <div className="p-6 border border-dashed rounded-xl text-center text-xs text-text-muted">
                                        Click products above to add them to this order bill.
                                    </div>
                                ) : (
                                    <div className="divide-y border rounded-xl bg-white overflow-hidden text-xs">
                                        {selectedItems.map((item, idx) => (
                                            <div key={idx} className="p-3 flex items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900">{item.name}</p>
                                                    <p className="text-text-muted">{item.weightLabel} @ ₹{item.price}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateItemQuantity(idx, item.quantity - 1)}
                                                        className="w-6 h-6 rounded bg-gray-100 font-bold hover:bg-gray-200"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-bold w-6 text-center">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateItemQuantity(idx, item.quantity + 1)}
                                                        className="w-6 h-6 rounded bg-gray-100 font-bold hover:bg-gray-200"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="w-16 text-right font-bold text-gray-900">
                                                    ₹{item.price * item.quantity}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => updateItemQuantity(idx, 0)}
                                                    className="text-gray-400 hover:text-red-600"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Payment Options: Paid vs Dues */}
                            <div className="p-4 bg-background-soft rounded-xl border border-border-custom space-y-3">
                                <label className="text-xs font-bold text-gray-700 uppercase block">Payment Status</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setPosPaymentType("Paid"); setPosPaymentMethod("Cash") }}
                                        className={cn(
                                            "py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2",
                                            posPaymentType === "Paid" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700 border-gray-200"
                                        )}
                                    >
                                        <CheckCircle2 size={16} /> Mark as PAID
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => { setPosPaymentType("Dues"); setPosPaymentMethod("POS_Dues") }}
                                        className={cn(
                                            "py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2",
                                            posPaymentType === "Dues" ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-700 border-gray-200"
                                        )}
                                    >
                                        <AlertCircle size={16} /> Mark as DUES (Credit)
                                    </button>
                                </div>

                                {posPaymentType === "Paid" && (
                                    <div className="flex items-center gap-3 pt-2">
                                        <label className="text-xs text-text-muted font-semibold">Payment Mode:</label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setPosPaymentMethod("Cash")}
                                                className={cn(
                                                    "px-3 py-1 rounded-lg text-xs font-bold border transition",
                                                    posPaymentMethod === "Cash" ? "bg-primary text-white border-primary" : "bg-white text-gray-700"
                                                )}
                                            >
                                                Cash
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPosPaymentMethod("UPI")}
                                                className={cn(
                                                    "px-3 py-1 rounded-lg text-xs font-bold border transition",
                                                    posPaymentMethod === "UPI" ? "bg-primary text-white border-primary" : "bg-white text-gray-700"
                                                )}
                                            >
                                                UPI / QR
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Total Bar */}
                            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                                <div>
                                    <p className="text-xs font-semibold text-text-muted">Total Payable Amount</p>
                                    <h3 className="text-2xl font-bold text-primary">₹{posSubtotal.toFixed(2)}</h3>
                                </div>
                                <div className="text-right text-xs">
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full font-bold uppercase",
                                        posPaymentType === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                    )}>
                                        {posPaymentType === "Paid" ? "Payment Received" : "Payment Pending (Dues)"}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowPosOrderModal(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold border text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={creatingOrder || selectedItems.length === 0}
                                    onClick={handleCreatePosOrder}
                                    className="px-6 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Printer size={16} />
                                    {creatingOrder ? "Generating..." : "Place Order & Print Bill"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 3: Order History Modal with Print Bill capability */}
            {showHistoryModal && selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative">
                        <div className="p-6 border-b border-border-custom flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedCustomer?.name}&apos;s Order History</h3>
                                <p className="text-xs text-text-muted">Orders placed at your store. Click &apos;Print Bill&apos; to view or print official customer invoice.</p>
                            </div>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="p-2 rounded-full hover:bg-background-soft transition text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {historyLoading ? (
                                <div className="space-y-4 py-10">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-background-soft rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            ) : customerOrders.length === 0 ? (
                                <div className="text-center py-20 text-text-muted bg-background-soft rounded-3xl border-2 border-dashed border-border-custom">
                                    <ShoppingCart size={40} className="mx-auto mb-3 opacity-20" />
                                    <p className="font-semibold text-base">No previous orders found for this customer</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-border-custom rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-background-soft text-xs font-bold text-text-muted uppercase">
                                            <tr>
                                                <th className="px-5 py-3.5">Order ID</th>
                                                <th className="px-5 py-3.5">Items</th>
                                                <th className="px-5 py-3.5">Date</th>
                                                <th className="px-5 py-3.5 text-right">Amount</th>
                                                <th className="px-5 py-3.5 text-center">Status</th>
                                                <th className="px-5 py-3.5 text-center">Bill</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-custom text-sm">
                                            {customerOrders.map((order: any) => (
                                                <tr key={order.id} className="hover:bg-background-soft/40 transition">
                                                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-primary">
                                                        #{order.id}
                                                    </td>
                                                    <td className="px-5 py-3.5 max-w-[200px] truncate font-medium">
                                                        {order.product || "Seafood Item"}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-text-muted text-xs">{order.date}</td>
                                                    <td className="px-5 py-3.5 text-right font-bold text-gray-900">₹{order.price}</td>
                                                    <td className="px-5 py-3.5 text-center">
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700">
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-center">
                                                        <button
                                                            onClick={() => fetchAndShowInvoice(order.id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition"
                                                        >
                                                            <Printer size={13} /> Print
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 4: Official Printable Invoice / Bill (Receipt Style) */}
            {showInvoiceModal && currentInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden">
                        {/* Action Bar (hidden in print) */}
                        <div className="p-4 bg-gray-100 border-b flex items-center justify-between print:hidden">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Customer Bill Preview</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={printInvoice}
                                    className="px-3.5 py-1.5 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-primary/90 transition"
                                >
                                    <Printer size={14} /> Print Now
                                </button>
                                <button
                                    onClick={() => setShowInvoiceModal(false)}
                                    className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Printable Receipt Container */}
                        <div id="printable-bill" className="p-6 font-mono text-xs space-y-4 text-gray-800 bg-white">
                            {/* Store Header */}
                            <div className="text-center pb-3 border-b border-dashed border-gray-400">
                                <h2 className="text-base font-black tracking-wider uppercase text-gray-900">{currentInvoice.store?.name}</h2>
                                <p className="text-[11px] text-gray-600">{currentInvoice.store?.address}</p>
                                <p className="text-[11px] text-gray-600">Ph: {currentInvoice.store?.phone}</p>
                                <p className="text-[10px] text-gray-500 mt-1">GSTIN: {currentInvoice.store?.gstin}</p>
                            </div>

                            {/* Order & Customer Metadata */}
                            <div className="space-y-1 pb-3 border-b border-dashed border-gray-400 text-[11px]">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Order ID:</span>
                                    <span className="font-bold">{currentInvoice.orderId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date:</span>
                                    <span>{new Date(currentInvoice.orderDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Customer:</span>
                                    <span className="font-bold">{currentInvoice.customer?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Phone:</span>
                                    <span>{currentInvoice.customer?.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Type:</span>
                                    <span className="font-bold uppercase">{currentInvoice.orderType}</span>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="pb-3 border-b border-dashed border-gray-400">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b text-[10px] uppercase text-gray-500">
                                            <th className="pb-1">Item</th>
                                            <th className="pb-1 text-center">Qty</th>
                                            <th className="pb-1 text-right">Price</th>
                                            <th className="pb-1 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentInvoice.items?.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="py-1.5 pr-1">
                                                    <p className="font-bold">{item.name}</p>
                                                    <p className="text-[10px] text-gray-500">{item.variant}</p>
                                                </td>
                                                <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                                                <td className="py-1.5 text-right">₹{item.price}</td>
                                                <td className="py-1.5 text-right font-bold">₹{item.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary Calculations */}
                            <div className="space-y-1.5 pb-3 border-b border-dashed border-gray-400 text-xs">
                                {currentInvoice.discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Coupon Discount ({currentInvoice.couponCode}):</span>
                                        <span>-₹{currentInvoice.discountAmount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-black text-sm text-gray-900 pt-1">
                                    <span>TOTAL PAYABLE:</span>
                                    <span>₹{currentInvoice.totalAmount}</span>
                                </div>
                            </div>

                            {/* Payment Status & Delivery OTP */}
                            <div className="pt-1 text-center space-y-2">
                                <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border">
                                    {currentInvoice.posPaymentType === "Dues" ? (
                                        <span className="text-amber-700 bg-amber-50">PAYMENT STATUS: DUES PENDING</span>
                                    ) : (
                                        <span className="text-emerald-700 bg-emerald-50">PAYMENT STATUS: PAID ({currentInvoice.paymentMethod})</span>
                                    )}
                                </div>

                                {currentInvoice.deliveryOtp && (
                                    <div className="p-2.5 bg-gray-100 rounded-xl border border-gray-300">
                                        <p className="text-[10px] text-gray-600 uppercase font-bold">Customer Delivery OTP</p>
                                        <p className="text-xl font-black tracking-widest text-primary">{currentInvoice.deliveryOtp}</p>
                                    </div>
                                )}

                                <p className="text-[10px] text-gray-400 mt-2">Thank you for ordering with Shrimpbite!</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
