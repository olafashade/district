import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function UserDashboardPage() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return <div>Access Denied</div>
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <p className="text-muted-foreground">Welcome to your dashboard.</p>
            </div>
        </div>
    )
}
