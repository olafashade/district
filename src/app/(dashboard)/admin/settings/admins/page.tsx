import { Button } from "@/components/ui/button"
import { getAdminUsers } from "@/lib/actions/admin-user"
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
import { AdminUserActions } from "@/components/admin/settings/admins/admin-user-actions"
import { Role, User } from "@prisma/client"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/login")

    const user = session?.user as any
    const privileges = (user?.privileges || []) as string[]
    const isSuperAdmin = user?.isSuperAdmin

    if (!isSuperAdmin && !privileges.includes("Admin") && !privileges.includes("Manage User")) {
        redirect("/admin/dashboard")
    }

    const result = await getAdminUsers()
    const users = (result.data || []) as (User & { userRole: Role | null })[]

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Admin Users</h2>
                <div className="flex items-center space-x-2">
                    <Link href="/admin/settings/admins/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Admin
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No admin users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.firstName} {user.middleName} {user.lastName}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone || "-"}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                            {user.userRole?.name || "Admin"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AdminUserActions user={user} />
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
