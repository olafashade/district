import { Button } from "@/components/ui/button"
import { getDistricts } from "@/lib/actions/district"
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
import { DistrictActions } from "@/components/admin/districts/district-actions"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DistrictsPage() {
    const session = await getServerSession(authOptions)
    if (!(session?.user as any).isSuperAdmin) {
        redirect("/admin/dashboard")
    }

    const result = await getDistricts()
    const districts = result.data || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Districts</h2>
                <div className="flex items-center space-x-2">
                    <Link href="/admin/districts/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add District
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Number</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Chapters</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {districts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    No districts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            districts.map((district) => (
                                <TableRow key={district.id}>
                                    <TableCell>{district.number}</TableCell>
                                    <TableCell className="font-medium">{district.name}</TableCell>
                                    <TableCell>{district.email || "-"}</TableCell>
                                    <TableCell>{(district as any)._count?.chapters || 0}</TableCell>
                                    <TableCell>{(district as any)._count?.users || 0}</TableCell>
                                    <TableCell className="text-right">
                                        <DistrictActions district={district} />
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
