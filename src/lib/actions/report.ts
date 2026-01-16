"use server"

import { prisma } from "@/lib/db"
import { FinancialStatus } from "@prisma/client"

export async function getMembersByStatus(status: FinancialStatus, districtId?: string, chapterId?: string) {
    try {
        const where: any = {
            role: "USER",
            financialStatus: status,
            deletedAt: null
        }

        if (districtId) where.districtId = districtId
        if (chapterId) where.chapterId = chapterId

        const members = await prisma.user.findMany({
            where,
            include: {
                district: true,
                chapter: true
            },
            orderBy: { lastName: 'asc' }
        })
        return { success: true, data: members }
    } catch (error) {
        console.error("Failed to get members by status:", error)
        return { success: false, data: [] }
    }
}

export async function getPaymentHistory(districtId?: string, chapterId?: string) {
    try {
        const where: any = {}

        if (districtId || chapterId) {
            where.user = {}
            if (districtId) where.user.districtId = districtId
            if (chapterId) where.user.chapterId = chapterId
        }

        const payments = await prisma.payment.findMany({
            where,
            orderBy: { date: 'desc' },
            include: {
                user: {
                    include: {
                        district: true,
                        chapter: true
                    }
                },
                fee: {
                    include: {
                        chapter: true
                    }
                }
            },
            take: 200 // Limit for now
        })
        return { success: true, data: payments }
    } catch (error) {
        console.error("Failed to get payment history:", error)
        return { success: false, data: [] }
    }
}
