"use server"

import { prisma } from "@/lib/db"
import { FinancialStatus } from "@prisma/client"

export async function getDashboardStats(currentUser: any) {
    if (!currentUser) return null

    // Determine scope
    // Rules from prompt:
    // 1. Total Districts - only super admin
    // 2. Total Chapters - super admin sees all, district user sees district's chapters
    // 3. Total District Users - same as above (assuming this means Users in the district, or district admins?) 
    // "Total District Users - Use same conditions as super admin and district user"
    // I'll interpret this as "Users belonging to the visible district(s)".
    // 4. Total Chapter User - user with chapter sees this based on chapter
    // 5. Financial stats (breakdown)

    const isSuperAdmin = currentUser.isSuperAdmin
    const userDistrictId = currentUser.districtId
    const userChapterId = currentUser.chapterId

    let totalDistricts = 0
    let totalChapters = 0
    let totalUsers = 0 // "Total District Users" / "Total Chapter Users"? 
    // The prompt distinguishes "Total District Users" and "Total Chapter user".
    // I'll return both aggregates if applicable, or a single "Total Users" depending on context.
    // Actually, let's return a detailed object.

    // 1. Total Districts
    if (isSuperAdmin) {
        totalDistricts = await prisma.district.count({ where: { deleted: false } })
    }

    // 2. Total Chapters
    const chapterWhere: any = { deleted: false }
    if (!isSuperAdmin && userDistrictId) {
        chapterWhere.districtId = userDistrictId
    }
    // If user has chapterId, do they see all chapters in district? 
    // Usually chapter admin only sees their chapter.
    // But the prompt says: "Total Chapters - super admin will see all chapters, a user with district in the session will see all chapter for his district"
    // It implies Chapter Admin might not see "Total Chapters" count, or maybe it's 1?
    // I'll assume if only chapterId is present, they see 1 (their own).
    if (!isSuperAdmin && !userDistrictId && userChapterId) {
        chapterWhere.id = userChapterId
    }

    // However, usually a hierarchy implies District Admin > Chapter Admin.
    totalChapters = await prisma.chapter.count({ where: chapterWhere })


    // 3. Total Users (Filtered)
    const userWhere: any = { deletedAt: null }

    // "Total District Users": Users in the visible district(s).
    if (!isSuperAdmin && userDistrictId) {
        userWhere.districtId = userDistrictId
    }
    // "Total Chapter user": Users in the visible chapter.
    if (!isSuperAdmin && userChapterId) {
        // Overwrite/refine district filter? A chapter belongs to a district, so usually chapterId is enough.
        userWhere.chapterId = userChapterId
    }

    const totalUsersCount = await prisma.user.count({ where: userWhere })


    // 4. Financial Stats (Financial, Non-Financial, Reclaimable)
    // These should respect the same visibility rules (userWhere).

    const financialMembers = await prisma.user.count({
        where: {
            ...userWhere,
            financialStatus: FinancialStatus.FINANCIAL_MEMBER
        }
    })

    const nonFinancialMembers = await prisma.user.count({
        where: {
            ...userWhere,
            financialStatus: FinancialStatus.NON_FINANCIAL_MEMBER
        }
    })

    const reclaimableMembers = await prisma.user.count({
        where: {
            ...userWhere,
            financialStatus: FinancialStatus.RECLAIMABLE_MEMBER
        }
    })

    return {
        totalDistricts: isSuperAdmin ? totalDistricts : null, // Only super admin sees
        totalChapters,
        totalUsers: totalUsersCount,
        financialStats: {
            financial: financialMembers,
            nonFinancial: nonFinancialMembers,
            reclaimable: reclaimableMembers
        }
    }
}
