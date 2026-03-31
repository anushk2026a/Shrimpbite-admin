"use client"

import {
    Search,
    Bell,
    Moon,
    ChevronDown,
    LogOut,
    CheckCircle2,
    Clock,
    ShoppingCart,
    ShieldAlert,
    Truck
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import useAuthStore from "@/data/store/useAuthStore"
import socket from "@/data/api/socket"
import notificationService from "@/data/services/notificationService"
import { toast } from "sonner"
import { adminMenu, retailerMenu } from "@/data/constants/navigation"
import adminService from "@/data/services/adminService"
import retailerService from "@/data/services/retailerService"
import { X, User, ShoppingBag, Store, ExternalLink, Package, Bike } from "lucide-react"

// Add local types for search results
type SearchResult = {
    id: string;
    title: string;
    subtitle?: string;
    type: 'module' | 'user' | 'order' | 'retailer' | 'product';
    href: string;
    icon?: any;
};

export default function Topbar() {
    const { user } = useAuthStore()
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Search State
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<{
        modules: SearchResult[];
        users: SearchResult[];
        orders: SearchResult[];
        retailers: SearchResult[];
        products: SearchResult[];
    }>({ modules: [], users: [], orders: [], retailers: [], products: [] })
    const [isSearching, setIsSearching] = useState(false)
    const [showSearchDropdown, setShowSearchDropdown] = useState(false)

    useEffect(() => {
        if (!user?._id) return

        fetchNotifications()

        // Socket logic for notifications
        socket.connect()
        const room = `retailer_notifications_${user._id}`
        socket.emit("join", room)

        socket.on("notification", (newNotif: any) => {
            setNotifications(prev => [newNotif, ...prev])
            setUnreadCount(prev => prev + 1)
            toast.info(newNotif.title, {
                description: newNotif.message
                // radius: "lg"
            })
        })

        // Click outside to close dropdowns
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            socket.off("notification")
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [user?._id])

    // Search Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length > 1) {
                performSearch()
            } else {
                setSearchResults({ modules: [], users: [], orders: [], retailers: [], products: [] })
                setShowSearchDropdown(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const performSearch = async () => {
        setShowSearchDropdown(true)
        setIsSearching(true)

        try {
            const role = user?.role || localStorage.getItem("role") || "admin";
            const currentMenu = role === "retailer" ? retailerMenu : adminMenu;

            // 1. Filter Modules (Instant)
            const filteredModules: SearchResult[] = [];
            currentMenu.forEach(group => {
                group.items.forEach(item => {
                    if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                        filteredModules.push({
                            id: item.href,
                            title: item.name,
                            subtitle: group.title,
                            type: 'module',
                            href: item.href,
                            icon: item.icon
                        });
                    }
                });
            });

            // 2. Fetch Data from API
            let users: SearchResult[] = [];
            let orders: SearchResult[] = [];
            let retailers: SearchResult[] = [];
            let products: SearchResult[] = [];

            if (role === "admin") {
                const [usersRes, ordersRes, retailersRes] = await Promise.allSettled([
                    adminService.getUsers(1, 10, searchQuery),
                    adminService.getOrders({ search: searchQuery }),
                    adminService.getRetailers("all", 1, 10, searchQuery)
                ]);

                if (usersRes.status === 'fulfilled' && usersRes.value?.success) {
                    const userData = usersRes.value.data || [];
                    users = userData.map((u: any) => ({
                        id: u._id,
                        title: u.fullName || u.name,
                        subtitle: u.email || u.phoneNumber,
                        type: 'user',
                        href: `/admin/users?search=${u.email || u.phoneNumber}`
                    }));
                }

                if (ordersRes.status === 'fulfilled' && ordersRes.value?.success) {
                    const orderData = ordersRes.value.data?.orders || [];
                    orders = orderData.map((o: any) => ({
                        id: o._id,
                        title: `Order #${o.orderId || o._id.slice(-6)}`,
                        subtitle: `${o.items?.[0]?.product?.name || 'Order'} - ${o.status}`,
                        type: 'order',
                        href: `/admin/orders?orderId=${o.orderId || o._id}`
                    }));
                }

                if (retailersRes.status === 'fulfilled' && retailersRes.value?.success) {
                    const retailerData = retailersRes.value.data || [];
                    retailers = retailerData.map((r: any) => ({
                        id: r._id,
                        title: r.businessDetails?.businessName || r.name,
                        subtitle: r.email || r.phone,
                        type: 'retailer',
                        href: `/admin/retailers?search=${r.businessDetails?.businessName || r.name}`
                    }));
                }
            } else if (role === "retailer") {
                const [ordersRes, productsRes, ridersRes] = await Promise.allSettled([
                    retailerService.getOrders(),
                    retailerService.getProducts(),
                    retailerService.getRiders()
                ]);

                if (ordersRes.status === 'fulfilled' && ordersRes.value?.success) {
                    const orderData = ordersRes.value.data?.orders || [];
                    orders = orderData
                        .filter((o: any) =>
                            o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            o.product.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .slice(0, 5)
                        .map((o: any) => ({
                            id: o.id,
                            title: `Order #${o.id.slice(-6)}`,
                            subtitle: `${o.product} - ${o.status}`,
                            type: 'order',
                            href: `/retailer/orders?search=${o.id}`
                        }));
                }

                if (productsRes.status === 'fulfilled' && productsRes.value?.success) {
                    const productData = productsRes.value.data || [];
                    products = productData
                        .filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice(0, 5)
                        .map((p: any) => ({
                            id: p._id,
                            title: p.name,
                            subtitle: `₹${p.price} - ${p.stock}kg in stock`,
                            type: 'product',
                            href: `/retailer/products/edit/${p._id}`,
                            icon: Package
                        }));
                }

                if (ridersRes.status === 'fulfilled' && ridersRes.value?.success) {
                    const riderData = ridersRes.value.data || [];
                    users = riderData
                        .filter((r: any) => r.user?.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice(0, 5)
                        .map((r: any) => ({
                            id: r._id,
                            title: r.user?.name,
                            subtitle: `Rider - ${r.status}`,
                            type: 'user',
                            href: `/retailer/riders`,
                            icon: Bike
                        }));
                }
            }

            setSearchResults({
                modules: filteredModules,
                users,
                orders,
                retailers,
                products
            });
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    }

    const fetchNotifications = async () => {
        try {
            const res = await notificationService.getNotifications()
            if (res.success) {
                setNotifications(res.notifications)
                setUnreadCount(res.notifications.filter((n: any) => !n.isRead).length)
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error)
        }
    }

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id)
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Failed to mark as read", error)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
            toast.success("All notifications marked as read")
        } catch (error) {
            console.error("Failed to mark all as read", error)
        }
    }

    const handleNotificationClick = async (n: any) => {
        if (!n.isRead) {
            await handleMarkAsRead(n._id)
        }

        const title = n.title.toLowerCase()
        const message = n.message.toLowerCase()

        if (title.includes("new order") || message.includes("new order")) {
            router.push("/retailer/orders?filter=Pending")
        } else if (title.includes("delivered") || title.includes("completed") || message.includes("delivered") || message.includes("completed")) {
            router.push("/retailer/orders?filter=Completed")
        } else if (n.type === "Inventory" || title.includes("inventory")) {
            router.push("/retailer/products")
        } else {
            // Default: just stay on current page or go to dashboard
            if (window.location.pathname !== "/retailer/dashboard" && !window.location.pathname.includes("/retailer/orders")) {
                router.push("/retailer/dashboard")
            }
        }

        setShowDropdown(false)
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "Order": return <ShoppingCart size={16} className="text-primary" />
            case "Rider": return <Truck size={16} className="text-blue-500" />
            case "Inventory": return <ShieldAlert size={16} className="text-warning" />
            default: return <Bell size={16} className="text-text-muted" />
        }
    }

    return (
        <header className="h-16 border-b border-border-custom bg-white flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex-1 flex items-center max-w-xl relative" ref={searchRef}>
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.trim().length > 1 && setShowSearchDropdown(true)}
                        placeholder="Search data, users, or reports"
                        className="w-full pl-10 pr-10 py-2 rounded-full bg-background-soft border-transparent focus:border-primary focus:bg-white transition-all text-sm outline-none"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary p-1"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchDropdown && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl border border-border-custom shadow-2xl animate-in slide-in-from-top-2 duration-200 z-50 overflow-hidden max-h-[80vh] flex flex-col">
                        <div className="p-3 border-b border-border-custom bg-background-soft/30 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">
                                {isSearching ? "Searching..." : "Search Results"}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
                            {/* Modules */}
                            {searchResults.modules?.length > 0 && (
                                <div className="mb-4">
                                    <div className="px-4 py-1 text-[10px] font-bold text-primary uppercase">Modules</div>
                                    {searchResults.modules.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                router.push(item.href);
                                                setShowSearchDropdown(false);
                                                setSearchQuery("");
                                            }}
                                            className="w-full px-4 py-2 hover:bg-primary/5 flex items-center gap-3 transition-colors text-left group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                <item.icon size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{item.title}</p>
                                                <p className="text-[10px] text-text-muted">{item.subtitle}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Products */}
                            {searchResults.products?.length > 0 && (
                                <div className="mb-4">
                                    <div className="px-4 py-1 text-[10px] font-bold text-orange-500 uppercase">Products</div>
                                    {searchResults.products.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                router.push(item.href);
                                                setShowSearchDropdown(false);
                                                setSearchQuery("");
                                            }}
                                            className="w-full px-4 py-2 hover:bg-orange-50 flex items-center gap-3 transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                                <Package size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{item.title}</p>
                                                <p className="text-[10px] text-text-muted">{item.subtitle}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Users */}
                            {searchResults.users?.length > 0 && (
                                <div className="mb-4">
                                    <div className="px-4 py-1 text-[10px] font-bold text-blue-500 uppercase">
                                        {user?.role === 'retailer' ? 'Riders' : 'Users'}
                                    </div>
                                    {searchResults.users.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                router.push(item.href);
                                                setShowSearchDropdown(false);
                                                setSearchQuery("");
                                            }}
                                            className="w-full px-4 py-2 hover:bg-blue-50 flex items-center gap-3 transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                {item.icon ? <item.icon size={16} /> : <User size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{item.title}</p>
                                                <p className="text-[10px] text-text-muted">{item.subtitle}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Orders */}
                            {searchResults.orders?.length > 0 && (
                                <div className="mb-4">
                                    <div className="px-4 py-1 text-[10px] font-bold text-emerald-500 uppercase">Orders</div>
                                    {searchResults.orders.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                router.push(item.href);
                                                setShowSearchDropdown(false);
                                                setSearchQuery("");
                                            }}
                                            className="w-full px-4 py-2 hover:bg-emerald-50 flex items-center gap-3 transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <ShoppingBag size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{item.title}</p>
                                                <p className="text-[10px] text-text-muted">{item.subtitle}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Retailers */}
                            {searchResults.retailers?.length > 0 && (
                                <div className="mb-4">
                                    <div className="px-4 py-1 text-[10px] font-bold text-amber-500 uppercase">Retailers</div>
                                    {searchResults.retailers.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                router.push(item.href);
                                                setShowSearchDropdown(false);
                                                setSearchQuery("");
                                            }}
                                            className="w-full px-4 py-2 hover:bg-amber-50 flex items-center gap-3 transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                                                <Store size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{item.title}</p>
                                                <p className="text-[10px] text-text-muted">{item.subtitle}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {!isSearching &&
                                searchResults.modules?.length === 0 &&
                                searchResults.users?.length === 0 &&
                                searchResults.orders?.length === 0 &&
                                searchResults.retailers?.length === 0 &&
                                searchResults.products?.length === 0 && (
                                    <div className="p-8 text-center text-text-muted">
                                        <Search size={32} className="mx-auto mb-3 opacity-20" />
                                        <p className="text-xs font-medium uppercase tracking-tight">No results found for "{searchQuery}"</p>
                                    </div>
                                )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={cn(
                            "p-2 rounded-full transition-all relative",
                            showDropdown ? "bg-primary/10 text-primary" : "hover:bg-background-soft text-text-muted"
                        )}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                                {unreadCount >= 10 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showDropdown && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-border-custom shadow-2xl animate-in slide-in-from-top-2 duration-200 z-50 overflow-hidden">
                            <div className="p-4 border-b border-border-custom flex items-center justify-between bg-primary/5">
                                <h3 className="font-bold text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-[10px] font-black uppercase text-primary hover:underline"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[350px] overflow-y-auto scrollbar-hide">
                                {notifications.length === 0 ? (
                                    <div className="p-12 text-center flex flex-col items-center gap-4 text-text-muted">
                                        <Bell size={32} className="opacity-20" />
                                        <p className="text-xs font-medium uppercase tracking-tight">No notifications yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border-custom">
                                        {notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                className={cn(
                                                    "p-4 hover:bg-background-soft/50 transition-colors cursor-pointer group relative",
                                                    !n.isRead && "bg-primary/5"
                                                )}
                                                onClick={() => handleNotificationClick(n)}
                                            >
                                                {!n.isRead && (
                                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)] z-10" />
                                                )}
                                                <div className="flex gap-3 pl-2">
                                                    <div className="w-8 h-8 rounded-full bg-white border border-border-custom flex items-center justify-center flex-shrink-0 shadow-sm">
                                                        {getIcon(n.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <p className={cn("text-xs font-bold truncate", n.isRead ? "text-text" : "text-primary")}>
                                                                {n.title}
                                                            </p>
                                                            <span className="text-[10px] text-text-muted whitespace-nowrap flex items-center gap-1 font-medium">
                                                                <Clock size={10} />
                                                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                                                            {n.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 border-t border-border-custom text-center bg-background-soft/20">
                                <button className="text-[10px] font-black underline uppercase text-text-muted hover:text-primary transition-colors">
                                    View All Activity
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 pl-4 border-l group">
                    <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center overflow-hidden border border-border-custom">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Admin'}`}
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold leading-tight">{user?.name || 'Guest'}</p>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{user?.role || 'User'}</p>
                    </div>
                    <button
                        onClick={() => {
                            document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                            localStorage.removeItem("role")
                            window.location.href = "/login"
                        }}
                        className="ml-2 p-1.5 rounded-lg hover:bg-red-50 text-text-muted hover:text-destructive transition-all"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    )
}
