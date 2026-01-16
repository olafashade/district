import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDashboardStats } from "@/lib/actions/dashboard"
import { StatCard } from "@/components/dashboard/stat-card"
import { DashboardChart } from "@/components/dashboard/dashboard-chart"
import { Users, Building, MapPin, DollarSign, Wallet, RefreshCw } from "lucide-react"

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return <div>Access Denied</div>
    }

    const stats = await getDashboardStats(session.user)

    if (!stats) {
        return <div>Loading stats...</div>
    }

    const chartData = [
        { name: 'Financial', value: stats.financialStats.financial },
        { name: 'Non-Financial', value: stats.financialStats.nonFinancial },
        { name: 'Reclaimable', value: stats.financialStats.reclaimable },
    ]

    const isSuperAdmin = (session.user as any).isSuperAdmin

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {stats.totalDistricts && (
                    <StatCard
                        title="Total Districts"
                        value={stats.totalDistricts}
                        icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                        description="All Registered Districts"
                    />
                )}
                <StatCard
                    title="Total Chapters"
                    value={stats.totalChapters}
                    icon={<Building className="h-4 w-4 text-muted-foreground" />}
                    description={isSuperAdmin ? "All Chapters" : "Chapters in your view"}
                />
                <StatCard
                    title="Total Members"
                    value={stats.totalUsers}
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    description="Total Registered Users"
                />
            </div>

            <h3 className="text-xl font-semibold mt-6">Membership Status</h3>
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Financial Members"
                    value={stats.financialStats.financial}
                    icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard
                    title="Non-Financial Members"
                    value={stats.financialStats.nonFinancial}
                    icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard
                    title="Reclaimable Members"
                    value={stats.financialStats.reclaimable}
                    icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
                <div className="col-span-4">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="p-6 flex flex-col space-y-0 pb-2">
                            <h3 className="font-semibold leading-none tracking-tight">Membership Distribution</h3>
                            <p className="text-sm text-muted-foreground">Breakdown of member financial status.</p>
                        </div>
                        <div className="p-6 pt-0 pl-2">
                            <DashboardChart data={chartData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
