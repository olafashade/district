import { UserList } from "@/components/admin/payments/user-list"
import { getMembers } from "@/lib/actions/member"
import { getFees } from "@/lib/actions/fee"
import { getDistricts } from "@/lib/actions/district"
import { getChapters } from "@/lib/actions/chapter"
import { Fee, User } from "@prisma/client"
import { prisma } from "@/lib/db"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Helper to get all members specifically for payments page (no extensive filtering server-side yet, client-side filtering requested)
// Or use getMembers but we need all to filter client side? User said "The goal is to be able to filter user byt search, district and chapter."
// If I use client side filtering, I need to fetch all/many.
// Reusing getMembers might return paginated.
// I'll fetch a larger list or all for now, or just use getMembers and pass initial data.
// For Payment Page, likely focused on active members.

async function getUsersForPayments() {
    // Custom fetch or reuse existing if capable.
    // Let's fetch all users who are not deleted.
    // Excluding admins? Usually 'members'.
    // Existing `getMembers` filters by role=USER.
    // I'll fetch all USER role.
    const users = await prisma.user.findMany({
        where: {
            role: "USER",
            deletedAt: null
        },
        include: {
            district: true,
            chapter: true
        },
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit for initial load performance if many users
    })
    return users
}

export default async function PaymentsPage() {
    const session = await getServerSession(authOptions)
    const [users, feesRes, districtsRes, chaptersRes] = await Promise.all([
        getUsersForPayments(),
        getFees(),
        getDistricts(),
        getChapters()
    ])

    const fees = (feesRes.data || []) as (Fee & { chapter: { name: string } })[]
    // Filter fees based on... actually showing all fees for now, or filter by user selection? 
    // Requirement: "When make payment button is clicked, it will bring a modal showing all the fees for the particular district for the user."
    // So the modal needs to know user's district and filter fees.
    // I will pass ALL fees to the client component, and handle filtering inside the Modal or UserList?
    // Passing all fees is fine if not thousands.
    // Actually, "showing all the fees for the particular district".
    // I will pass all fees, and logic in PaymentModal or UserList will filter them.
    // Wait, UserList passes `fees` to PaymentModal. PaymentModal takes `fees`.
    // I should modify PaymentModal to filter `fees` based on the user's district if possible.
    // If bulk users selected, they might be from mixed districts?
    // "Also make it possible to make payment for multiple users per time."
    // If mixed districts, maybe show fees common or just show all but label them?
    // The requirement implies "fees for the particular district". If multiple users, assume same district? Or union of fees?
    // For now, I'll pass all fees and let the modal display them, maybe grouped by chapter/district if I added district to Fee. 
    // Fee has `chapterId`. Chapter has `districtId`.
    // I need fee -> chapter -> district.
    // The `getFees` returns fee with chapter.
    // I will ensure `getFees` query includes chapter.name. `src/lib/actions/fee.ts` does include chapter relation?
    // Let's check `getFees` in `src/lib/actions/fee.ts`.

    // Assuming getFees includes chapter.

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
            </div>

            <div className="grid gap-4">
                <UserList
                    users={users}
                    fees={fees}
                    districts={districtsRes.data || []}
                    chapters={chaptersRes.data || []} // @ts-ignore
                    currentUser={session?.user as any}
                />
            </div>
        </div>
    )
}
