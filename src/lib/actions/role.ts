"use server"

import { prisma } from "@/lib/db"
import { roleSchema } from "@/lib/validations/role"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function createRole(data: z.infer<typeof roleSchema>) {
    const result = roleSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "Invalid data", error: result.error.flatten() }
    }

    try {
        const role = await prisma.role.create({
            data: {
                name: result.data.name,
                abbreviation: result.data.abbreviation,
                privileges: result.data.privileges,
                districtId: result.data.districtId,
            },
        })

        revalidatePath("/admin/settings/roles")
        return { success: true, message: "Role created successfully", data: role }
    } catch (error) {
        console.error("Failed to create role:", error)
        return { success: false, message: "Failed to create role" }
    }
}

export async function updateRole(id: string, data: z.infer<typeof roleSchema>) {
    const result = roleSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "Invalid data", error: result.error.flatten() }
    }

    try {
        const role = await prisma.role.update({
            where: { id },
            data: {
                name: result.data.name,
                abbreviation: result.data.abbreviation,
                privileges: result.data.privileges,
                districtId: result.data.districtId,
            }
        })

        revalidatePath("/admin/settings/roles")
        return { success: true, message: "Role updated successfully", data: role }
    } catch (error) {
        console.error("Failed to update role:", error)
        return { success: false, message: "Failed to update role" }
    }
}

export async function deleteRole(id: string) {
    try {
        // Soft delete
        await prisma.role.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        })

        revalidatePath("/admin/settings/roles")
        return { success: true, message: "Role deleted successfully" }
    } catch (error) {
        console.error("Failed to delete role:", error)
        return { success: false, message: "Failed to delete role" }
    }
}

export async function getRoles(districtId?: string) {
    try {
        const roles = await prisma.role.findMany({
            where: {
                deletedAt: null,
                ...(districtId ? { districtId } : {})
            },
            orderBy: { createdAt: 'desc' },
            include: {
                district: true
            }
        })
        return { success: true, data: roles }
    } catch (error) {
        console.error("Failed to get roles:", error);
        return { success: false, data: [] }
    }
}

export async function getRole(id: string) {
    try {
        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                district: true
            }
        })
        if (!role) return { success: false, message: "Role not found" }
        return { success: true, data: role }
    } catch (error) {
        console.error("Failed to get role:", error);
        return { success: false, message: "Failed to get role" }
    }
}
