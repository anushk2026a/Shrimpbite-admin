import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    ArrowLeftRight,
    List,
    Star,
    UserCog,
    ShieldCheck,
    Wallet,
    BellRing,
    CalendarCheck,
    LucideIcon
} from "lucide-react"

export type MenuItem = {
    name: string;
    icon: LucideIcon;
    href: string;
};

export type MenuGroup = {
    title: string;
    items: MenuItem[];
};

export const adminMenu: MenuGroup[] = [
    {
        title: "Main menu",
        items: [
            { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
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

export const retailerMenu: MenuGroup[] = [
    {
        title: "Store Management",
        items: [
            { name: "Dashboard", icon: LayoutDashboard, href: "/retailer/dashboard" },
            { name: "My Products", icon: List, href: "/retailer/products" },
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
