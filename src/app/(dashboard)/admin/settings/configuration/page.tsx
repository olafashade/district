import { Button } from "@/components/ui/button"
import { getConfigurations } from "@/lib/actions/configuration"
import { Plus } from "lucide-react"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ConfigurationActions } from "@/components/admin/settings/configuration/configuration-actions"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SyncButton } from "@/components/admin/configuration/sync-button"

export default async function ConfigurationPage() {
    const session = await getServerSession(authOptions)
    if (!(session?.user as any).isSuperAdmin) {
        redirect("/admin/settings")
    }

    const result = await getConfigurations()
    const configs = result.data || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Configuration</h2>
                <div className="flex items-center space-x-2">
                    <SyncButton />
                    <Link href="/admin/settings/configuration/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Key
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Key</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {configs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">
                                    No configurations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            configs.map((config) => (
                                <TableRow key={config.id}>
                                    <TableCell className="font-medium">{config.key}</TableCell>
                                    <TableCell>{config.value}</TableCell>
                                    <TableCell className="text-right">
                                        <ConfigurationActions config={config} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div >
    )
}
