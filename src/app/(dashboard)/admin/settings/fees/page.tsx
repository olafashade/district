import { Button } from "@/components/ui/button"
import { getFees } from "@/lib/actions/fee"
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
import { FeeActions } from "@/components/admin/settings/fees/fee-actions"
import { Fee, Chapter } from "@prisma/client"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

import { redirect } from "next/navigation"

export default async function FeesPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/login")

    const user = session?.user as any
    const privileges = (user?.privileges || []) as string[]
    const isSuperAdmin = user?.isSuperAdmin

    if (!isSuperAdmin && !privileges.includes("Admin")) {
        redirect("/admin/dashboard")
    }

    const filterChapterId = user?.isSuperAdmin ? undefined : user?.chapterId

    const result = await getFees(filterChapterId)
    // Explicitly type fees to ensure chapter relation is recognized
    const fees = (result.data || []) as (Fee & { chapter: Chapter | null })[]

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Fees Management</h2>
                <div className="flex items-center space-x-2">
                    <Link href="/admin/settings/fees/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Fee
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fee Name</TableHead>
                            <TableHead>Abbreviation</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Chapter</TableHead>
                            <TableHead>Membership Fee</TableHead>
                            <TableHead>New Member Fee</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    No fees found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            fees.map((fee) => (
                                <TableRow key={fee.id}>
                                    <TableCell className="font-medium">{fee.name}</TableCell>
                                    <TableCell>{fee.abbreviation || "-"}</TableCell>
                                    <TableCell>{fee.amount}</TableCell>
                                    <TableCell>{fee.chapter?.name || "-"}</TableCell>
                                    <TableCell>{fee.membershipFee ? "Yes" : "No"}</TableCell>
                                    <TableCell>{fee.newMembershipFee ? "Yes" : "No"}</TableCell>
                                    <TableCell className="text-right">
                                        <FeeActions fee={fee} />
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
