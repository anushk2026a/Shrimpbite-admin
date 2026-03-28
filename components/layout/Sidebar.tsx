"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    TicketPercent,
    Layers,
    ArrowLeftRight,
    PlusCircle,
    List,
    Star,
    UserCog,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Wallet,
    BellRing,
    CalendarCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import useAuthStore from "@/data/store/useAuthStore"

type MenuItem = {
    name: string;
    icon: React.ElementType;
    href: string;
};

type MenuGroup = {
    title: string;
    items: MenuItem[];
};

const adminMenu: MenuGroup[] = [
    {
        title: "Main menu",
        items: [
            { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
            // { name: "Shops", icon: Star, href: "/admin/shops" },
            { name: "Retailers", icon: Users, href: "/admin/retailers" },
            { name: "App Users", icon: Users, href: "/admin/users" },
            { name: "Order Management", icon: ShoppingCart, href: "/admin/orders" },
            { name: "Payout Settlements", icon: Wallet, href: "/admin/payouts" },
            { name: "Communication Hub", icon: BellRing, href: "/admin/communication" },
        ]
    },
    {
        title: "Admin Control",
        items: [
            { name: "Admin role", icon: UserCog, href: "/admin/roles" },
            { name: "Control Authority", icon: ShieldCheck, href: "/admin/authority" },
        ]
    }
]

const retailerMenu: MenuGroup[] = [
    {
        title: "Store Management",
        items: [
            { name: "Dashboard", icon: LayoutDashboard, href: "/retailer/dashboard" },
            { name: "My Products", icon: List, href: "/retailer/products" },
            // { name: "Add Product", icon: PlusCircle, href: "/retailer/products/add" },
            { name: "Orders", icon: ShoppingCart, href: "/retailer/orders" },
            { name: "Riders", icon: Users, href: "/retailer/riders" },
            { name: "Daily Prep List", icon: CalendarCheck, href: "/retailer/prep-list" },
            { name: "Reviews", icon: Star, href: "/retailer/reviews" },
            { name: "Store Settings", icon: UserCog, href: "/retailer/settings" },
        ]
    },
    {
        title: "Business",
        items: [
            { name: "Revenue", icon: ArrowLeftRight, href: "/retailer/revenue" },
            { name: "Customers", icon: Users, href: "/retailer/customers" },
        ]
    }
]

export default function Sidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { user } = useAuthStore()
    const [role, setRole] = useState<string | null>(null)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setMounted(true)
        if (user) {
            setRole(user.role)
            localStorage.setItem("role", user.role)
        } else {
            setRole(localStorage.getItem("role") || "admin")
        }
    }, [user])

    const handleToggle = () => {
        setCollapsed(!collapsed)
    }

    if (!mounted) {
        return <aside className="w-64 border-r border-border-custom bg-white h-screen sticky top-0 animate-pulse" />
    }

    const filterMenuByPermissions = (menuGroups: MenuGroup[]) => {
        if (!user || role !== "admin") return menuGroups;
        
        // Super Admin (no specific adminRole assigned) sees everything
        if (!user.adminRole) return menuGroups;

        const allowedModules = user.adminRole.modules || [];

        return menuGroups.map(group => ({
            ...group,
            items: group.items.filter((item) => allowedModules.includes(item.name))
        })).filter(group => group.items.length > 0);
    };

    const menuGroups = role === "retailer" ? retailerMenu : filterMenuByPermissions(adminMenu);

    return (
        <aside className={cn(
            "flex flex-col border-r border-border-custom bg-white transition-all duration-300 h-screen sticky top-0",
            collapsed ? "w-20" : "w-64"
        )}>
            {/* Logo */}
            <div className="p-6 flex items-center gap-3 overflow-hidden whitespace-nowrap">
                <Link href={role === "retailer" ? "/retailer/dashboard" : "/admin/dashboard"} className="flex items-center gap-3 shrink-0">
                    <img
                        src="/loginlogo.png"
                        alt="Shrimpbite Logo"
                        className="w-10 h-10 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] shrink-0"
                    />
                    <span className={cn(
                        "font-bold text-xl text-primary tracking-tight transition-all duration-300 overflow-hidden",
                        collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}>
                        Shrimbite
                    </span>
                </Link>
            </div>

            <button
                onClick={handleToggle}
                className="absolute -right-3 top-20 bg-white border border-border-custom rounded-full p-1 hover:bg-primary-light transition-colors z-50 shadow-sm"
            >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 scrollbar-hide">
                {menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-6">
                        <h3 className={cn(
                            "text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 px-2 transition-all duration-300 overflow-hidden",
                            collapsed ? "opacity-0 h-0 mb-0" : "opacity-100 h-auto mb-4"
                        )}>
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={`${groupIndex}-${item.name}`}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                                : "text-foreground hover:bg-primary-light hover:text-primary"
                                        )}
                                    >
                                        <item.icon size={20} className={cn(
                                            "shrink-0",
                                            !isActive && "text-text-muted group-hover:text-primary"
                                        )} />
                                        <span className={cn(
                                            "font-medium whitespace-nowrap transition-all duration-300 overflow-hidden",
                                            collapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3"
                                        )}>
                                            {item.name}
                                        </span>
                                        {collapsed && (
                                            <div className="absolute left-full ml-6 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                                {item.name}
                                            </div>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-border-custom mt-auto">
                <Link
                    href="https://shrimpbite.in"
                    target="_blank"
                    className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg border border-border-custom hover:border-primary transition-all text-xs font-medium overflow-hidden whitespace-nowrap",
                        collapsed ? "w-0 opacity-0 border-transparent p-0" : "w-full opacity-100"
                    )}
                >
                    <span>Shrimbite Website</span>
                    <ArrowLeftRight size={14} className="rotate-45" />
                </Link>
            </div>
        </aside>
    )
}
