import { Button } from "@/components/ui/button"
import { getMembers } from "@/lib/actions/member"
import { getDistricts } from "@/lib/actions/district"
import { getChapters } from "@/lib/actions/chapter"
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
import { MemberActions } from "@/components/admin/members/member-actions"
import { MemberFilters } from "@/components/admin/members/member-filters"
import { MembersPagination } from "@/components/admin/members/members-pagination"

interface MembersPageProps {
    searchParams: Promise<{
        page?: string
        limit?: string
        search?: string
        districtId?: string
        chapterId?: string
    }>
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function MembersPage({ searchParams }: MembersPageProps) {
    const session = await getServerSession(authOptions)
    const currentUser = session?.user as any

    const params = await searchParams
    const page = Number(params.page) || 1
    const limit = Number(params.limit) || 10
    const search = params.search || ""

    let districtId = params.districtId || ""
    let chapterId = params.chapterId || ""

    // Enforce restriction
    if (currentUser && !currentUser.isSuperAdmin) {
        if (currentUser.districtId) districtId = currentUser.districtId
        if (currentUser.chapterId) chapterId = currentUser.chapterId
    }

    const [membersRes, districtsRes, chaptersRes] = await Promise.all([
        getMembers({ page, limit, search, districtId, chapterId }),
        getDistricts(),
        getChapters()
    ])

    const members = membersRes.data || []
    const districts = districtsRes.data || []
    const chapters = chaptersRes.data || []
    const meta = membersRes.meta || { total: 0, page: 1, limit: 10, totalPages: 0 }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Members</h2>
                <div className="flex items-center space-x-2">
                    <Link href="/admin/members/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Member
                        </Button>
                    </Link>
                </div>
            </div>

            <MemberFilters districts={districts} chapters={chapters} currentUser={currentUser} />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Control #</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Chapter</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    No members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>{member.controlNumber || "-"}</TableCell>
                                    <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>{member.chapter?.name || "-"}</TableCell>
                                    <TableCell>{member.district?.name || "-"}</TableCell>
                                    <TableCell>{member.role}</TableCell>
                                    <TableCell className="text-right">
                                        <MemberActions member={member} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <MembersPagination
                currentPage={page}
                totalPages={meta.totalPages}
                totalItems={meta.total}
                limit={limit}
            />
        </div>
    )
}
