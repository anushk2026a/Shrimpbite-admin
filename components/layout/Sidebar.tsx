"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    ChevronLeft,
    ChevronRight,
    ArrowLeftRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import useAuthStore from "@/data/store/useAuthStore"
import { adminMenu, retailerMenu, MenuGroup } from "@/data/constants/navigation"

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
            "flex flex-col border-r border-border-custom bg-white transition-all duration-300 h-screen sticky top-0 shrink-0",
            collapsed ? "w-16" : "w-52"
        )}>
            {/* Logo */}
            <div className="px-4 py-3.5 flex items-center gap-2.5 overflow-hidden whitespace-nowrap border-b border-border-custom/40">
                <Link href={role === "retailer" ? "/retailer/dashboard" : "/admin/dashboard"} className="flex items-center gap-2.5 shrink-0">
                    <img
                        src="/loginlogo.png"
                        alt="Shrimpbite Logo"
                        className="w-7 h-7 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] shrink-0"
                    />
                    <span className={cn(
                        "font-bold text-base text-primary tracking-tight transition-all duration-300 overflow-hidden",
                        collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}>
                        Shrimbite
                    </span>
                </Link>
            </div>

            <button
                onClick={handleToggle}
                className="absolute -right-2.5 top-14 bg-white border border-border-custom rounded-full p-1 hover:bg-primary-light transition-colors z-50 shadow-sm"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-2.5 scrollbar-hide">
                {menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-3.5">
                        <h3 className={cn(
                            "text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 px-2 transition-all duration-300 overflow-hidden",
                            collapsed ? "opacity-0 h-0 mb-0" : "opacity-100 h-auto mb-1.5"
                        )}>
                            {group.title}
                        </h3>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={`${groupIndex}-${item.name}`}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 group relative text-xs",
                                            isActive
                                                ? "bg-primary text-white shadow-sm shadow-primary/20 font-bold"
                                                : "text-foreground hover:bg-primary-light hover:text-primary font-medium"
                                        )}
                                    >
                                        <item.icon size={16} className={cn(
                                            "shrink-0",
                                            !isActive && "text-text-muted group-hover:text-primary"
                                        )} />
                                        <span className={cn(
                                            "whitespace-nowrap transition-all duration-300 overflow-hidden",
                                            collapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-1.5"
                                        )}>
                                            {item.name}
                                        </span>
                                        {collapsed && (
                                            <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
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
            <div className="p-2.5 border-t border-border-custom mt-auto">
                <Link
                    href="https://shrimpbite.in"
                    target="_blank"
                    className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-border-custom hover:border-primary transition-all text-[11px] font-medium overflow-hidden whitespace-nowrap",
                        collapsed ? "w-0 opacity-0 border-transparent p-0" : "w-full opacity-100"
                    )}
                >
                    <span>Website</span>
                    <ArrowLeftRight size={12} className="rotate-45" />
                </Link>
            </div>
        </aside>
    )
}
