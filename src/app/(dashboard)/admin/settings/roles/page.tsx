import { Button } from "@/components/ui/button"
import { getRoles } from "@/lib/actions/role"
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
import { RoleActions } from "@/components/admin/settings/roles/role-actions"
import { Role, District } from "@prisma/client"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

import { redirect } from "next/navigation"

export default async function RolesPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/login")

    const user = session?.user as any
    const privileges = (user?.privileges || []) as string[]
    const isSuperAdmin = user?.isSuperAdmin

    if (!isSuperAdmin && !privileges.includes("Admin")) {
        redirect("/admin/dashboard")
    }

    const filterDistrictId = user?.isSuperAdmin ? undefined : user?.districtId

    const result = await getRoles(filterDistrictId)
    const roles = (result.data || []) as (Role & { district: District | null })[]

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Roles Management</h2>
                <div className="flex items-center space-x-2">
                    <Link href="/admin/settings/roles/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Role
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Role Name</TableHead>
                            <TableHead>Abbreviation</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Privileges</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No roles found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">{role.name}</TableCell>
                                    <TableCell>{role.abbreviation || "-"}</TableCell>
                                    <TableCell>{role.district?.name || "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {role.privileges.slice(0, 3).map((priv, idx) => (
                                                <span key={idx} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                                    {priv}
                                                </span>
                                            ))}
                                            {role.privileges.length > 3 && (
                                                <span className="text-xs text-muted-foreground self-center">
                                                    +{role.privileges.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <RoleActions role={role} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
