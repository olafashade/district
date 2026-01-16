"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
    Home,
    Users,
    Building,
    CreditCard,
    FileText,
    Settings,
    MapPin,
    Calendar,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import * as React from "react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    isAdmin: boolean;
    isSuperAdmin?: boolean;
    districtShield?: string;
    privileges?: string[];
}

export function SidebarNav({ className, isAdmin, isSuperAdmin = false, districtShield, privileges = [], ...props }: SidebarNavProps) {
    const pathname = usePathname();
    const [openItems, setOpenItems] = React.useState<string[]>([]);

    interface Route {
        title: string;
        href: string;
        icon: any;
        submenu?: {
            title: string;
            href: string;
        }[];
    }

    const adminRoutes: Route[] = [
        {
            title: "Dashboard",
            href: "/admin/dashboard",
            icon: Home,
        },
        ...(isSuperAdmin || privileges.includes("Manage District") ? [{
            title: "Manage Districts",
            href: "/admin/districts",
            icon: MapPin,
        }] : []),
        ...(isSuperAdmin || privileges.includes("Manage Chapter") ? [{
            title: "Manage Chapters",
            href: "/admin/chapters",
            icon: Building,
        }] : []),
        ...(isSuperAdmin || privileges.includes("Manage Member") ? [{
            title: "Manage Members",
            href: "/admin/members",
            icon: Users,
        }] : []),
        ...(isSuperAdmin || privileges.includes("Manage Payment") ? [{
            title: "Payments",
            href: "/admin/payments",
            icon: CreditCard,
        }] : []),
        ...(isSuperAdmin || privileges.includes("Reporting") ? [{
            title: "Reports",
            href: "/admin/reports",
            icon: FileText,
            submenu: [
                {
                    title: "Financial Members",
                    href: "/admin/reports/financial-members",
                },
                {
                    title: "Non-Financial Members",
                    href: "/admin/reports/non-financial-members",
                },
                {
                    title: "Reclaimable Members",
                    href: "/admin/reports/reclaimable-members",
                },
                {
                    title: "Payment History",
                    href: "/admin/reports/payment-history",
                }
            ]
        }] : []),
        {
            title: "Settings",
            href: "/admin/settings",
            icon: Settings,
            submenu: [
                ...(isSuperAdmin || privileges.includes("Admin") ? [{
                    title: "Fees",
                    href: "/admin/settings/fees",
                }, {
                    title: "Manage Roles",
                    href: "/admin/settings/roles",
                }] : []),
                ...(isSuperAdmin ? [{
                    title: "Configuration",
                    href: "/admin/settings/configuration",
                }] : []),
                ...(isSuperAdmin || privileges.includes("Admin") || privileges.includes("Manage User") ? [{
                    title: "Admin Users",
                    href: "/admin/settings/admins",
                }] : [])
            ]
        },
    ];

    const userRoutes: Route[] = [
        {
            title: "Dashboard",
            href: "/user/dashboard",
            icon: Home,
        },
        {
            title: "My Chapter",
            href: "/user/chapter",
            icon: Building,
        },
        {
            title: "My Payments",
            href: "/user/payments",
            icon: CreditCard,
        },
        {
            title: "Events",
            href: "/user/events",
            icon: Calendar,
        },
        {
            title: "Settings",
            href: "/user/settings",
            icon: Settings,
        },
    ];

    const routes = isAdmin ? adminRoutes : userRoutes;

    React.useEffect(() => {
        // Auto-expand active parent
        const activeParent = routes.find(
            route => route.submenu && pathname.startsWith(route.href)
        );
        if (activeParent) {
            setOpenItems(prev => {
                if (!prev.includes(activeParent.title)) {
                    return [...prev, activeParent.title];
                }
                return prev;
            });
        }
    }, [pathname]); // Depend on pathname/routes

    const toggleItem = (title: string) => {
        setOpenItems(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        );
    };

    return (
        <nav
            className={cn(
                "flex flex-col space-y-2 text-white bg-primary p-4 h-full overflow-y-auto",
                className
            )}
            {...props}
        >
            <div className="flex flex-col items-center mb-8">
                {districtShield ? (
                    <img src={districtShield} alt="District Shield" className="w-24 h-24 mb-4 object-contain" />
                ) : (
                    <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-4 object-contain" />
                )}
                <div className="font-bold text-center">District Portal</div>
            </div>
            {routes.map((item) => {
                const isActive = pathname === item.href || (item.submenu ? pathname.startsWith(item.href) : false);
                const isOpen = openItems.includes(item.title);

                return (
                    <div key={item.href} className="w-full">
                        <Link
                            href={item.href}
                            onClick={(e) => {
                                if (item.submenu) {
                                    e.preventDefault();
                                    toggleItem(item.title);
                                }
                            }}
                            className={cn(
                                buttonVariants({ variant: "ghost" }),
                                isActive && !item.submenu // Highlight standalone items or parent if strictly matched (logic might vary)
                                    ? "bg-white/20 hover:bg-white/30 text-white"
                                    : "hover:bg-white/10 text-white/80 hover:text-white",
                                "justify-between text-base px-4 py-6 rounded-none w-full flex items-center"
                            )}
                        >
                            <div className="flex items-center">
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.title}
                            </div>
                            {item.submenu && (
                                isOpen
                                    ? <ChevronDown className="h-4 w-4" />
                                    : <ChevronRight className="h-4 w-4" />
                            )}
                        </Link>
                        {item.submenu && isOpen && (
                            <div className="ml-4 mt-1 space-y-1 border-l border-white/20 pl-4">
                                {item.submenu.map((subItem) => {
                                    const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + "/");
                                    return (
                                        <Link
                                            key={subItem.href}
                                            href={subItem.href}
                                            className={cn(
                                                buttonVariants({ variant: "ghost" }),
                                                isSubActive
                                                    ? "bg-white/20 text-white"
                                                    : "text-white/70 hover:text-white hover:bg-white/10",
                                                "justify-start text-sm px-4 py-2 h-auto w-full transition-colors"
                                            )}
                                        >
                                            {subItem.title}
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            })}
        </nav>
    );
}
