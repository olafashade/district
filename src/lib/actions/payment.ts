"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createPayment(data: {
    userId: string
    feeId: string
    amount: number
    status?: string // Default 'Completed' as per request implication "make payment"
    paymentYear?: number
}) {
    try {
        const payment = await prisma.payment.create({
            data: {
                userId: data.userId,
                feeId: data.feeId,
                amount: data.amount,
                status: data.status || "Completed",
                paymentYear: data.paymentYear,
                date: new Date(),
            },
        })
        return { success: true, data: payment }
    } catch (error) {
        console.error("Failed to create payment:", error)
        return { success: false, message: "Failed to create payment" }
    }
}

export async function createBulkPayments(data: {
    userIds: string[]
    feeId: string
    amount: number
    status?: string
    paymentYear?: number
}) {
    try {
        const results = await Promise.all(
            data.userIds.map(userId =>
                prisma.payment.create({
                    data: {
                        userId: userId,
                        feeId: data.feeId,
                        amount: data.amount,
                        status: data.status || "Completed",
                        paymentYear: data.paymentYear,
                        date: new Date(),
                    }
                })
            )
        )
        revalidatePath("/admin/payments")
        return { success: true, count: results.length, message: `${results.length} payments created successfully` }
    } catch (error) {
        console.error("Failed to create bulk payments:", error)
        return { success: false, message: "Failed to create payments" }
    }
}

export async function getPayments(searchParams?: {
    page?: number
    limit?: number
}) {
    // Basic fetch for logging/history
    // For now just return latest 50
    try {
        const payments = await prisma.payment.findMany({
            take: 50,
            orderBy: { date: 'desc' },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
                fee: {
                    select: {
                        name: true,
                    }
                }
            }
        })
        return { success: true, data: payments }
    } catch (error) {
        console.error("Failed to get payments:", error)
        return { success: false, data: [] }
    }
}

export async function getFeesForDistrict(districtId: string) {
    try {
        // Fetch fees associated with chapters in this district?
        // OR fees that belong to chapters in this district.
        // The Fee model has `chapterId`.
        // So we need to find all chapters in the district, then find fees for those chapters.
        const chapters = await prisma.chapter.findMany({
            where: { districtId, deletedAt: null },
            select: { id: true }
        })

        const chapterIds = chapters.map(c => c.id)

        const fees = await prisma.fee.findMany({
            where: {
                chapterId: { in: chapterIds },
                deletedAt: null
            },
            include: {
                chapter: {
                    select: { name: true }
                }
            }
        })
        return { success: true, data: fees }

    } catch (error) {
        console.error("Failed to get fees:", error)
        return { success: false, data: [] }
    }
}
