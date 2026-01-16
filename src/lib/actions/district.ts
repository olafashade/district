"use server"

import { prisma } from "@/lib/db"
import { districtSchema } from "@/lib/validations/district"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function createDistrict(data: z.infer<typeof districtSchema>) {
    const result = districtSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "Invalid data", error: result.error.flatten() }
    }

    try {
        const district = await prisma.district.create({
            data: {
                name: result.data.name,
                number: result.data.number,
                email: result.data.email || null,
                shieldUrl: result.data.shieldUrl,
                phone: result.data.phone || null,
            },
        })

        revalidatePath("/admin/districts")
        return { success: true, message: "District created successfully", data: district }
    } catch (error) {
        console.error("Failed to create district:", error)
        return { success: false, message: "Failed to create district" }
    }
}

export async function updateDistrict(id: string, data: z.infer<typeof districtSchema>) {
    const result = districtSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "Invalid data", error: result.error.flatten() }
    }

    try {
        const district = await prisma.district.update({
            where: { id },
            data: {
                name: result.data.name,
                number: result.data.number,
                email: result.data.email || null,
                shieldUrl: result.data.shieldUrl,
                phone: result.data.phone || null,
            }
        })

        revalidatePath("/admin/districts")
        return { success: true, message: "District updated successfully", data: district }
    } catch (error) {
        console.error("Failed to update district:", error)
        return { success: false, message: "Failed to update district" }
    }
}

export async function deleteDistrict(id: string) {
    try {
        await prisma.district.update({
            where: { id },
            data: { deletedAt: new Date(), deleted: true }
        })

        revalidatePath("/admin/districts")
        return { success: true, message: "District deleted successfully" }
    } catch (error) {
        console.error("Failed to delete district:", error)
        return { success: false, message: "Failed to delete district" }
    }
}

export async function getDistricts() {
    try {
        const districts = await prisma.district.findMany({
            where: { deleted: false },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { chapters: true, users: true }
                }
            }
        })

        return { success: true, data: districts }
    } catch (error) {
        return { success: false, data: [] }
    }
}

export async function getDistrict(id: string) {
    try {
        const district = await prisma.district.findFirst({
            where: { id, deleted: false }
        })
        if (!district) return { success: false, message: "District not found" }
        return { success: true, data: district }
    } catch (error) {
        return { success: false, message: "Failed to get district" }
    }
}
