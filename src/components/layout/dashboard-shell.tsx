"use client";

import { UserNav } from "@/components/layout/user-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserSidebarNav } from "@/components/layout/user-sidebar-nav";
import { useSession } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const userData = session?.user as any;
    const isAdmin = userData?.role === "ADMIN";
    const isSuperAdmin = userData?.isSuperAdmin;
    const privileges = userData?.privileges;
    const districtShield = userData?.districtShield;
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setOpen(false)
    }, [pathname]);

    const router = useRouter();

    useEffect(() => {
        if (!session) return;

        if (pathname.startsWith("/profile")) return;

        if (isAdmin && !pathname.startsWith("/admin")) {
            router.push("/admin/dashboard");
        } else if (!isAdmin && session && !pathname.startsWith("/user")) {
            router.push("/user/dashboard");
        }
    }, [session, isAdmin, pathname, router]);


    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 z-50 bg-primary shadow-xl">
                {isAdmin ? (
                    <SidebarNav isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} privileges={privileges} districtShield={districtShield} className="h-full" />
                ) : (
                    <UserSidebarNav districtShield={districtShield} className="h-full" />
                )}
            </aside>

            {/* Mobile Content Wrapper */}
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b w-full">
                    <div className="flex h-16 items-center px-6 justify-between">
                        <div className="flex items-center gap-4">
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="lg:hidden">
                                        <Menu className="h-6 w-6" />
                                        <span className="sr-only">Toggle Menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-64 border-r-0">
                                    {isAdmin ? (
                                        <SidebarNav isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} privileges={privileges} districtShield={districtShield} />
                                    ) : (
                                        <UserSidebarNav districtShield={districtShield} />
                                    )}
                                </SheetContent>
                            </Sheet>
                            <h1 className="text-lg font-semibold md:text-xl lg:hidden">
                                District Portal
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <UserNav />
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-8 pt-6 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
