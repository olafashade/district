"use server"

import { prisma } from "@/lib/db"
import { chapterSchema } from "@/lib/validations/chapter"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function createChapter(data: z.infer<typeof chapterSchema>) {
    const result = chapterSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "Invalid data", error: result.error.flatten() }
    }

    try {
        const chapter = await prisma.chapter.create({
            data: {
                name: result.data.name,
                code: result.data.code,
                email: result.data.email || null,
                phone: result.data.phone || null,
                address: result.data.address || null,
                mailingAddress: result.data.mailingAddress,
                state: result.data.state || null,
                city: result.data.city || null,
                zipcode: result.data.zipcode || null,
                districtId: result.data.districtId,
            },
        })

        revalidatePath("/admin/chapters")
        return { success: true, message: "Chapter created successfully", data: chapter }
    } catch (error) {
        console.error("Failed to create chapter:", error)
        return { success: false, message: "Failed to create chapter" }
    }
}

export async function updateChapter(id: string, data: z.infer<typeof chapterSchema>) {
    const result = chapterSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "Invalid data", error: result.error.flatten() }
    }

    try {
        const chapter = await prisma.chapter.update({
            where: { id },
            data: {
                name: result.data.name,
                code: result.data.code,
                email: result.data.email || null,
                phone: result.data.phone || null,
                address: result.data.address || null,
                mailingAddress: result.data.mailingAddress,
                state: result.data.state || null,
                city: result.data.city || null,
                zipcode: result.data.zipcode || null,
                districtId: result.data.districtId,
            }
        })

        revalidatePath("/admin/chapters")
        return { success: true, message: "Chapter updated successfully", data: chapter }
    } catch (error) {
        console.error("Failed to update chapter:", error)
        return { success: false, message: "Failed to update chapter" }
    }
}

export async function deleteChapter(id: string) {
    try {
        await prisma.chapter.update({
            where: { id },
            data: { deletedAt: new Date(), deleted: true }
        })

        revalidatePath("/admin/chapters")
        return { success: true, message: "Chapter deleted successfully" }
    } catch (error) {
        console.error("Failed to delete chapter:", error)
        return { success: false, message: "Failed to delete chapter" }
    }
}

export async function getChapters(districtId?: string) {
    try {
        const chapters = await prisma.chapter.findMany({
            where: {
                deleted: false,
                ...(districtId ? { districtId } : {})
            },
            orderBy: { createdAt: 'desc' },
            include: {
                district: true,
                _count: {
                    select: { users: true }
                }
            }
        })
        console.log(chapters);
        return { success: true, data: chapters }
    } catch (error) {
        console.error("Failed to get chapters:", error);
        return { success: false, data: [] }
    }
}

export async function getChapter(id: string) {
    try {
        const chapter = await prisma.chapter.findFirst({
            where: { id, deleted: false },
            include: {
                district: true
            }
        })
        if (!chapter) return { success: false, message: "Chapter not found" }
        return { success: true, data: chapter }
    } catch (error) {
        console.error("Failed to get chapter:", error);
        return { success: false, message: "Failed to get chapter" }
    }
}
