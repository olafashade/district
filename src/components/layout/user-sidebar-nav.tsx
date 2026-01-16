"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
    Home,
} from "lucide-react";
import * as React from "react";

interface UserSidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    districtShield?: string;
}

export function UserSidebarNav({ className, districtShield, ...props }: UserSidebarNavProps) {
    const pathname = usePathname();

    const routes = [
        {
            title: "Dashboard",
            href: "/user/dashboard",
            icon: Home,
        },
    ];

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
                const isActive = pathname === item.href;

                return (
                    <div key={item.href} className="w-full">
                        <Link
                            href={item.href}
                            className={cn(
                                buttonVariants({ variant: "ghost" }),
                                isActive
                                    ? "bg-white/20 hover:bg-white/30 text-white"
                                    : "hover:bg-white/10 text-white/80 hover:text-white",
                                "justify-start text-base px-4 py-6 rounded-none w-full flex items-center"
                            )}
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.title}
                        </Link>
                    </div>
                )
            })}
        </nav>
    );
}
