import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import DashboardShell from "@/components/layout/dashboard-shell"
import { Providers } from "@/components/layout/providers"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    console.log(session);
    if (!session) {
        redirect("/login")
    }

    return (
        <Providers>
            <DashboardShell>
                {children}
            </DashboardShell>
        </Providers>
    )
}
