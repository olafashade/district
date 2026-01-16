import { ReportPaymentTable } from "@/components/admin/reports/report-payment-table"
import { getPaymentHistory } from "@/lib/actions/report"
import { getDistricts } from "@/lib/actions/district"
import { getChapters } from "@/lib/actions/chapter"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function PaymentHistoryPage() {
    const session = await getServerSession(authOptions)

    const currentUser = session?.user as any
    let filterDistrictId: string | undefined
    let filterChapterId: string | undefined

    if (currentUser && !currentUser.isSuperAdmin) {
        if (currentUser.districtId) filterDistrictId = currentUser.districtId
        if (currentUser.chapterId) filterChapterId = currentUser.chapterId
    }

    const [paymentsRes, districtsRes, chaptersRes] = await Promise.all([
        getPaymentHistory(filterDistrictId, filterChapterId),
        getDistricts(),
        getChapters()
    ])

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ReportPaymentTable
                payments={paymentsRes.data || [] as any}
                districts={districtsRes.data || []}
                chapters={chaptersRes.data || [] as any}
                currentUser={session?.user as any}
            />
        </div>
    )
}
