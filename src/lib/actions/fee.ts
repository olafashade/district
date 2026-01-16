"use server"

import { prisma } from "@/lib/db"
import { feeSchema } from "@/lib/validations/fee"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function createFee(data: z.infer<typeof feeSchema>) {
    const result = feeSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "Invalid data", error: result.error.flatten() }
    }

    try {
        const fee = await prisma.fee.create({
            data: {
                name: result.data.name,
                abbreviation: result.data.abbreviation,
                amount: result.data.amount,
                chapterId: result.data.chapterId,
                membershipFee: result.data.membershipFee,
                newMembershipFee: result.data.newMembershipFee,
            },
        })

        revalidatePath("/admin/settings/fees")
        return { success: true, message: "Fee created successfully", data: fee }
    } catch (error) {
        console.error("Failed to create fee:", error)
        return { success: false, message: "Failed to create fee" }
    }
}

export async function updateFee(id: string, data: z.infer<typeof feeSchema>) {
    const result = feeSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "Invalid data", error: result.error.flatten() }
    }

    try {
        const fee = await prisma.fee.update({
            where: { id },
            data: {
                name: result.data.name,
                abbreviation: result.data.abbreviation,
                amount: result.data.amount,
                chapterId: result.data.chapterId,
                membershipFee: result.data.membershipFee,
                newMembershipFee: result.data.newMembershipFee,
            }
        })

        revalidatePath("/admin/settings/fees")
        return { success: true, message: "Fee updated successfully", data: fee }
    } catch (error) {
        console.error("Failed to update fee:", error)
        return { success: false, message: "Failed to update fee" }
    }
}

export async function deleteFee(id: string) {
    try {
        // Soft delete
        await prisma.fee.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        })

        revalidatePath("/admin/settings/fees")
        return { success: true, message: "Fee deleted successfully" }
    } catch (error) {
        console.error("Failed to delete fee:", error)
        return { success: false, message: "Failed to delete fee" }
    }
}

export async function getFees(chapterId?: string) {
    try {
        const fees = await prisma.fee.findMany({
            where: {
                deletedAt: null,
                ...(chapterId ? { chapterId } : {})
            },
            orderBy: { createdAt: 'desc' },
            include: {
                chapter: true
            }
        })
        return { success: true, data: fees }
    } catch (error) {
        console.error("Failed to get fees:", error);
        return { success: false, data: [] }
    }
}

export async function getFee(id: string) {
    try {
        const fee = await prisma.fee.findUnique({
            where: { id },
            include: {
                chapter: true
            }
        })
        if (!fee) return { success: false, message: "Fee not found" }
        return { success: true, data: fee }
    } catch (error) {
        console.error("Failed to get fee:", error);
        return { success: false, message: "Failed to get fee" }
    }
}
