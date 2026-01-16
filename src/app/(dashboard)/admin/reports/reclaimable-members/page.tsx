import { ReportMemberTable } from "@/components/admin/reports/report-member-table"
import { getMembersByStatus } from "@/lib/actions/report"
import { getDistricts } from "@/lib/actions/district"
import { getChapters } from "@/lib/actions/chapter"
import { FinancialStatus } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function ReclaimableMembersPage() {
    const session = await getServerSession(authOptions)

    const currentUser = session?.user as any
    let filterDistrictId: string | undefined
    let filterChapterId: string | undefined

    if (currentUser && !currentUser.isSuperAdmin) {
        if (currentUser.districtId) filterDistrictId = currentUser.districtId
        if (currentUser.chapterId) filterChapterId = currentUser.chapterId
    }

    const [membersRes, districtsRes, chaptersRes] = await Promise.all([
        getMembersByStatus(FinancialStatus.RECLAIMABLE_MEMBER, filterDistrictId, filterChapterId),
        getDistricts(),
        getChapters()
    ])

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ReportMemberTable
                members={membersRes.data || []}
                districts={districtsRes.data || []}
                chapters={chaptersRes.data || [] as any}
                title="Reclaimable Members"
                currentUser={session?.user as any}
            />
        </div>
    )
}
