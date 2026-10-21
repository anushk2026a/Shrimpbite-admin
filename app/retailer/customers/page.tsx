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

    const addItemToPos = (product: any, chosenVariant?: any) => {
        const variant = chosenVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : null)
        const price = variant ? Number(variant.price || 0) : Number(product.price || 0)
        const weightLabel = variant
            ? (variant.label || variant.weight || `${variant.weightValue || ''} ${variant.weightUnit || ''}`.trim() || 'Standard')
            : `${product.stock || 1} kg`

        const targetVariantId = variant?._id ? String(variant._id) : undefined

        const existingIndex = selectedItems.findIndex(i =>
            i.productId === product._id && (i.variantId === targetVariantId || (!i.variantId && !targetVariantId))
        )
        if (existingIndex > -1) {
            const updated = [...selectedItems]
            updated[existingIndex].quantity += 1
            setSelectedItems(updated)
        } else {
            setSelectedItems([...selectedItems, {
                productId: product._id,
                name: product.name,
                variantId: targetVariantId,
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
            const cleanOrderId = String(orderId).replace(/^#/, "")
            const res = await apiClient.get(`/retailer/pos-order/${cleanOrderId}/invoice`)
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
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">Store Customers & POS</h1>
                    <p className="text-xs text-text-muted mt-0.5">
                        Manage your customer base, register walk-in buyers, create One-time / Subscription orders with Paid/Dues, and print bills.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAddCustomerModal(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition shadow-sm"
                    >
                        <UserPlus size={15} /> Add New Customer
                    </button>
                </div>
            </div>

            {/* Metrics & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                <div className="lg:col-span-1 space-y-2.5">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-3 rounded-xl border border-border-custom shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">{stat.title}</p>
                                <h3 className="text-lg font-bold text-gray-900 leading-none">{stat.value}</h3>
                            </div>
                            <div className={cn("p-2 rounded-lg", stat.color)}>
                                <stat.icon size={18} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-2 bg-white p-3.5 rounded-xl border border-border-custom shadow-sm overflow-hidden flex flex-col justify-between">
                    <h3 className="text-xs font-bold text-gray-900 mb-1">Customer Acquisition (Last 7 Days)</h3>
                    <div className="h-[120px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={customersData.chartData}>
                                <defs>
                                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6CC51D" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6CC51D" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#868889" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#868889" }} />
                                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 10px rgba(0,0,0,0.08)", fontSize: "11px" }} />
                                <Area type="monotone" dataKey="customers" stroke="#6CC51D" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGrowth)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Customers Table + Action Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3.5">
                <div className="lg:col-span-3 bg-white rounded-xl border border-border-custom shadow-sm overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-border-custom flex items-center justify-between">
                        <h3 className="text-xs font-bold text-gray-900">Customer Directory</h3>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1 rounded-lg bg-background-soft border-transparent text-xs outline-none w-56 focus:bg-white focus:ring-1 focus:ring-primary/30"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-primary/5 text-[10px] font-bold text-primary uppercase sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="px-3.5 py-2">Customer</th>
                                    <th className="px-3.5 py-2">Contact</th>
                                    <th className="px-3.5 py-2">Orders</th>
                                    <th className="px-3.5 py-2">Total Spent</th>
                                    <th className="px-3.5 py-2">Category</th>
                                    <th className="px-3.5 py-2 text-center">POS Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-custom text-xs">
                                {filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-text-muted text-xs">
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
                                            <td className="px-3.5 py-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full overflow-hidden border bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px] shrink-0">
                                                        {c.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-900 block leading-tight">{c.name}</span>
                                                        {c.isManualCustomer && (
                                                            <span className="text-[9px] font-semibold text-primary uppercase">Manual Walk-in</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-3.5 py-2 font-medium text-text-muted">{c.phone}</td>

                                            <td className="px-3.5 py-2">
                                                <span className="font-semibold text-gray-900">{c.orderCount} Orders</span>
                                            </td>

                                            <td className="px-3.5 py-2 font-bold text-primary">₹{c.spend}</td>

                                            <td className="px-3.5 py-2">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase inline-block",
                                                    c.status === "VIP" ? "bg-purple-100 text-purple-700" :
                                                    c.status === "New" ? "bg-blue-100 text-blue-700" :
                                                    "bg-emerald-100 text-emerald-700"
                                                )}>
                                                    {c.status}
                                                </span>
                                            </td>

                                            <td className="px-3.5 py-2 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                             e.stopPropagation()
                                                             openEditCustomerModal(c)
                                                        }}
                                                        className="p-1 rounded-md text-gray-400 hover:text-primary hover:bg-primary/10 transition"
                                                        title="Edit Customer"
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setSelectedCustomer(c)
                                                            setShowPosOrderModal(true)
                                                        }}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md text-xs font-bold transition"
                                                    >
                                                        <ShoppingCart size={12} /> POS Order
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
                    <div className="bg-white rounded-xl border border-border-custom shadow-sm p-3.5 space-y-3.5 h-fit sticky top-4">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden mx-auto mb-2 border border-primary/20 flex items-center justify-center font-bold text-primary text-base">
                                {selectedCustomer.name.slice(0, 2).toUpperCase()}
                            </div>
                            <h3 className="font-bold text-sm text-gray-900 leading-tight">{selectedCustomer.name}</h3>
                            <p className="text-[11px] text-text-muted flex items-center justify-center gap-1 mt-0.5">
                                <Phone size={10} /> {selectedCustomer.phone}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-border-custom">
                            <div className="bg-background-soft p-2 rounded-lg border border-border-custom/50">
                                <p className="text-[9px] text-text-muted uppercase font-bold mb-0.5">Orders</p>
                                <p className="text-sm font-bold text-gray-900">{selectedCustomer.orderCount}</p>
                            </div>
                            <div className="bg-background-soft p-2 rounded-lg border border-border-custom/50">
                                <p className="text-[9px] text-text-muted uppercase font-bold mb-0.5">Total Spent</p>
                                <p className="text-sm font-bold text-primary">₹{selectedCustomer.spend}</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <button
                                onClick={() => setShowPosOrderModal(true)}
                                className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-sm hover:bg-primary/90 transition flex items-center justify-center gap-1.5"
                            >
                                <ShoppingCart size={14} /> Create POS Order
                            </button>

                            <button
                                onClick={() => openEditCustomerModal(selectedCustomer)}
                                className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border border-border-custom"
                            >
                                <Pencil size={12} /> Edit Customer Details
                            </button>

                            <button
                                onClick={() => setShowHistoryModal(true)}
                                className="w-full py-1.5 bg-background-soft text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border border-border-custom"
                            >
                                <TrendingUp size={12} /> View Order History
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-border-custom shadow-sm p-4 flex flex-col items-center justify-center text-center h-[220px] text-text-muted">
                        <Users size={32} className="mb-2 opacity-20" />
                        <p className="text-xs">Select a customer to initiate orders</p>
                    </div>
                )}
            </div>

            {/* Modal 1: Add New Customer */}
            {showAddCustomerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Add New Walk-in Customer</h3>
                                <p className="text-[11px] text-text-muted">Register a customer for counter billing and POS orders.</p>
                            </div>
                            <button
                                onClick={() => setShowAddCustomerModal(false)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {customerError && (
                            <div className="mx-5 mt-3 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                                {customerError}
                            </div>
                        )}

                        <form onSubmit={handleAddCustomer}>
                            <div className="p-5 space-y-3">
                                <div>
                                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                                        Customer Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Ramesh Kumar"
                                        value={newCustomer.fullName}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, fullName: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-200/90 text-xs text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="e.g. 9876543210"
                                        value={newCustomer.phoneNumber}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-200/90 text-xs text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                                        Email (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="customer@email.com"
                                        value={newCustomer.email}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-200/90 text-xs text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                                        Street Address
                                    </label>
                                    <textarea
                                        placeholder="Flat / House No, Street, Landmark"
                                        rows={2}
                                        value={newCustomer.address}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-200/90 text-xs text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            value={newCustomer.city}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                                            className="w-full px-3 py-1.5 rounded-xl bg-gray-50/80 border border-gray-200/90 text-xs text-gray-800 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                                            Pincode
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="560001"
                                            value={newCustomer.pincode}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, pincode: e.target.value })}
                                            className="w-full px-3 py-1.5 rounded-xl bg-gray-50/80 border border-gray-200/90 text-xs text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-3 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddCustomerModal(false)}
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 bg-white transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addingCustomer}
                                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Edit Customer Profile</h3>
                                <p className="text-[11px] text-text-muted">Update contact or delivery address details.</p>
                            </div>
                            <button
                                onClick={() => setShowEditCustomerModal(false)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {editCustomerError && (
                            <div className="mx-5 mt-3 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                                {editCustomerError}
                            </div>
                        )}

                        <form onSubmit={handleUpdateCustomer}>
                            <div className="p-5 space-y-3">
                                <div>
                                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                                        Customer Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editCustomerData.fullName}
                                        onChange={(e) => setEditCustomerData({ ...editCustomerData, fullName: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-200/90 text-xs text-gray-800 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={editCustomerData.phoneNumber}
                                        onChange={(e) => setEditCustomerData({ ...editCustomerData, phoneNumber: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-200/90 text-xs text-gray-800 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                                        Email (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        value={editCustomerData.email}
                                        onChange={(e) => setEditCustomerData({ ...editCustomerData, email: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-200/90 text-xs text-gray-800 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                                        Street Address
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={editCustomerData.address}
                                        onChange={(e) => setEditCustomerData({ ...editCustomerData, address: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-200/90 text-xs text-gray-800 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            value={editCustomerData.city}
                                            onChange={(e) => setEditCustomerData({ ...editCustomerData, city: e.target.value })}
                                            className="w-full px-3 py-1.5 rounded-xl bg-gray-50/80 border border-gray-200/90 text-xs text-gray-800 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                                            Pincode
                                        </label>
                                        <input
                                            type="text"
                                            value={editCustomerData.pincode}
                                            onChange={(e) => setEditCustomerData({ ...editCustomerData, pincode: e.target.value })}
                                            className="w-full px-3 py-1.5 rounded-xl bg-gray-50/80 border border-gray-200/90 text-xs text-gray-800 outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-3 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditCustomerModal(false)}
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 bg-white transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingEditCustomer}
                                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
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
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 flex flex-col max-h-[88vh] overflow-hidden">
                        {/* Fixed Header */}
                        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Initiate POS Counter Order</h3>
                                <p className="text-[11px] text-text-muted mt-0.5">
                                    Customer: <span className="font-bold text-gray-900">{selectedCustomer.name}</span> ({selectedCustomer.phone})
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPosOrderModal(false)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {orderError && (
                            <div className="mx-5 mt-3 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                                {orderError}
                            </div>
                        )}

                        {/* Scrollable Body */}
                        <div className="p-5 overflow-y-auto flex-1 space-y-4">
                            {/* Order Type Toggle */}
                            <div className="grid grid-cols-2 p-1 bg-gray-100/80 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setPosOrderType("One-time")}
                                    className={cn(
                                        "py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5",
                                        posOrderType === "One-time"
                                            ? "bg-white text-primary shadow-sm"
                                            : "text-gray-500 hover:text-gray-900"
                                    )}
                                >
                                    <ShoppingCart size={13} /> One-Time Order
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPosOrderType("Subscription")}
                                    className={cn(
                                        "py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5",
                                        posOrderType === "Subscription"
                                            ? "bg-white text-primary shadow-sm"
                                            : "text-gray-500 hover:text-gray-900"
                                    )}
                                >
                                    <Calendar size={13} /> Subscription Order
                                </button>
                            </div>

                            {/* Subscription Frequency (if Subscription) */}
                            {posOrderType === "Subscription" && (
                                <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-1.5">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                                        Delivery Frequency
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(["Daily", "Alternate Days", "Weekly"] as const).map((freq) => (
                                            <button
                                                key={freq}
                                                type="button"
                                                onClick={() => setPosFrequency(freq)}
                                                className={cn(
                                                    "py-1 text-xs font-bold rounded-lg border transition",
                                                    posFrequency === freq
                                                        ? "bg-primary text-white border-primary shadow-sm"
                                                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                                )}
                                            >
                                                {freq}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Product Selector with Explicit Prices and Variants */}
                            <div>
                                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">
                                    Select Products & Weights
                                </label>
                                <div className="space-y-2 max-h-48 overflow-y-auto p-1.5 rounded-xl bg-gray-50/70 border border-gray-200/80">
                                    {productsData && productsData.length > 0 ? (
                                        productsData.map((prod: any) => {
                                            const hasVariants = prod.variants && prod.variants.length > 0
                                            return (
                                                <div
                                                    key={prod._id}
                                                    className="p-2.5 bg-white rounded-xl border border-gray-200/80 hover:border-primary/40 transition shadow-xs"
                                                >
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <p className="font-bold text-gray-900 text-xs">{prod.name}</p>
                                                        <span className="text-[10px] font-semibold text-gray-400">
                                                            {hasVariants ? `${prod.variants.length} Weight Packs` : `Standard`}
                                                        </span>
                                                    </div>

                                                    {/* Variant Pills with exact price */}
                                                    {hasVariants ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {prod.variants.map((v: any) => (
                                                                <button
                                                                    key={v._id || v.label}
                                                                    type="button"
                                                                    onClick={() => addItemToPos(prod, v)}
                                                                    className="px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-primary text-gray-700 hover:text-white text-[11px] font-semibold border border-gray-200/90 transition flex items-center gap-1.5 group cursor-pointer"
                                                                >
                                                                    <span>{v.label || `${v.weightValue} ${v.weightUnit}`}</span>
                                                                    <span className="font-bold text-primary group-hover:text-white">
                                                                        ₹{v.price}
                                                                    </span>
                                                                    <Plus size={12} className="opacity-60 group-hover:opacity-100" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => addItemToPos(prod)}
                                                            className="px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold transition flex items-center gap-1.5"
                                                        >
                                                            <span>₹{prod.price || 0}</span>
                                                            <Plus size={12} /> Add to Order
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <p className="p-4 text-xs text-text-muted text-center">No products found in store catalog.</p>
                                    )}
                                </div>
                            </div>

                            {/* Selected Items List */}
                            <div>
                                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">
                                    Selected Items ({selectedItems.length})
                                </label>
                                {selectedItems.length === 0 ? (
                                    <div className="p-5 border border-dashed border-gray-300 rounded-xl text-center text-xs text-text-muted bg-gray-50/50">
                                        Click on any product weight above to add it to this order.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 border border-gray-200/90 rounded-xl bg-white overflow-hidden text-xs">
                                        {selectedItems.map((item, idx) => (
                                            <div key={idx} className="p-2.5 px-3 flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">{item.name}</p>
                                                    <p className="text-[11px] text-text-muted">
                                                        <span className="px-1.5 py-0.2 rounded bg-gray-100 font-semibold text-gray-700 mr-1.5">
                                                            {item.weightLabel}
                                                        </span>
                                                        @ ₹{item.price} each
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateItemQuantity(idx, item.quantity - 1)}
                                                        className="w-5 h-5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs transition"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-bold w-5 text-center text-xs">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateItemQuantity(idx, item.quantity + 1)}
                                                        className="w-5 h-5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="w-16 text-right font-bold text-gray-900 text-xs">
                                                    ₹{(item.price * item.quantity).toFixed(2)}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => updateItemQuantity(idx, 0)}
                                                    className="p-1 text-gray-400 hover:text-red-600 rounded transition"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Payment Options: Paid vs Dues */}
                            <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/80 space-y-2.5">
                                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block">
                                    Payment Settlement
                                </label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => { setPosPaymentType("Paid"); setPosPaymentMethod("Cash") }}
                                        className={cn(
                                            "p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2",
                                            posPaymentType === "Paid"
                                                ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        <CheckCircle2 size={15} className={posPaymentType === "Paid" ? "text-emerald-600" : "text-gray-400"} />
                                        <span>Mark as PAID</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => { setPosPaymentType("Dues"); setPosPaymentMethod("POS_Dues") }}
                                        className={cn(
                                            "p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2",
                                            posPaymentType === "Dues"
                                                ? "bg-amber-50 border-amber-500 text-amber-800 shadow-xs"
                                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        <AlertCircle size={15} className={posPaymentType === "Dues" ? "text-amber-600" : "text-gray-400"} />
                                        <span>Mark as DUES (Credit)</span>
                                    </button>
                                </div>

                                {posPaymentType === "Paid" && (
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="text-[11px] text-gray-500 font-medium">Payment Mode:</span>
                                        <div className="flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setPosPaymentMethod("Cash")}
                                                className={cn(
                                                    "px-2.5 py-0.5 rounded-lg text-xs font-bold border transition",
                                                    posPaymentMethod === "Cash"
                                                        ? "bg-primary text-white border-primary"
                                                        : "bg-white text-gray-600 border-gray-200"
                                                )}
                                            >
                                                💵 Cash
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPosPaymentMethod("UPI")}
                                                className={cn(
                                                    "px-2.5 py-0.5 rounded-lg text-xs font-bold border transition",
                                                    posPaymentMethod === "UPI"
                                                        ? "bg-primary text-white border-primary"
                                                        : "bg-white text-gray-600 border-gray-200"
                                                )}
                                            >
                                                📱 UPI / QR Code
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sticky Footer - Always Visible */}
                        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Payable</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-xl font-black text-gray-900 leading-none">₹{posSubtotal.toFixed(2)}</h3>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                                        posPaymentType === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                    )}>
                                        {posPaymentType === "Paid" ? "Settled" : "Dues"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPosOrderModal(false)}
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 bg-white transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={creatingOrder || selectedItems.length === 0}
                                    onClick={handleCreatePosOrder}
                                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <Printer size={14} />
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
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
                        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">{selectedCustomer?.name}&apos;s Order History</h3>
                                <p className="text-[11px] text-text-muted mt-0.5">
                                    All orders placed at your store. Click &apos;Print Bill&apos; to view or print official customer invoice.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            {historyLoading ? (
                                <div className="space-y-3 py-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : customerOrders.length === 0 ? (
                                <div className="text-center py-16 text-text-muted bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
                                    <ShoppingCart size={36} className="mx-auto mb-2 opacity-25" />
                                    <p className="font-semibold text-xs text-gray-700">No previous orders found for this customer</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-xs">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                            <tr>
                                                <th className="px-4 py-2.5">Order ID</th>
                                                <th className="px-4 py-2.5">Items</th>
                                                <th className="px-4 py-2.5">Date</th>
                                                <th className="px-4 py-2.5 text-right">Amount</th>
                                                <th className="px-4 py-2.5 text-center">Status</th>
                                                <th className="px-4 py-2.5 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-xs">
                                            {customerOrders.map((order: any) => (
                                                <tr key={order.id || order.dbId} className="hover:bg-gray-50/60 transition">
                                                    <td className="px-4 py-2.5 font-mono text-xs font-bold text-primary">
                                                        #{order.id}
                                                    </td>
                                                    <td className="px-4 py-2.5 max-w-[220px] truncate font-medium text-gray-900">
                                                        {order.product || "Seafood Item"}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-text-muted text-[11px]">{order.date}</td>
                                                    <td className="px-4 py-2.5 text-right font-bold text-gray-900">₹{order.price}</td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase inline-block",
                                                            order.status === "Delivered" || order.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                                                            order.status === "Payment Pending" ? "bg-amber-100 text-amber-800" :
                                                            order.status === "Cancelled" ? "bg-red-100 text-red-800" :
                                                            "bg-blue-100 text-blue-800"
                                                        )}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <button
                                                            onClick={() => fetchAndShowInvoice(order.orderId || order.id || order.dbId)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-xs font-semibold transition"
                                                        >
                                                            <Printer size={12} /> Print Bill
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
