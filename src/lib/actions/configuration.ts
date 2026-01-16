"use server"

import { prisma } from "@/lib/db"
import { configurationSchema } from "@/lib/validations/configuration"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function createConfiguration(data: z.infer<typeof configurationSchema>) {
    const result = configurationSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "Invalid data", error: result.error.flatten() }
    }

    try {
        const existing = await prisma.configuration.findUnique({
            where: { key: result.data.key }
        })

        if (existing) {
            return { success: false, message: "Key already exists" }
        }

        const config = await prisma.configuration.create({
            data: {
                key: result.data.key,
                value: result.data.value,
            },
        })

        revalidatePath("/admin/settings/configuration")
        return { success: true, message: "Configuration created successfully", data: config }
    } catch (error) {
        console.error("Failed to create configuration:", error)
        return { success: false, message: "Failed to create configuration" }
    }
}

export async function updateConfiguration(id: string, data: z.infer<typeof configurationSchema>) {
    const result = configurationSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "Invalid data", error: result.error.flatten() }
    }

    try {
        // Check uniqueness of key if changed
        const existing = await prisma.configuration.findFirst({
            where: {
                key: result.data.key,
                NOT: { id }
            }
        })

        if (existing) {
            return { success: false, message: "Key already exists" }
        }

        const config = await prisma.configuration.update({
            where: { id },
            data: {
                key: result.data.key,
                value: result.data.value,
            }
        })

        revalidatePath("/admin/settings/configuration")
        return { success: true, message: "Configuration updated successfully", data: config }
    } catch (error) {
        console.error("Failed to update configuration:", error)
        return { success: false, message: "Failed to update configuration" }
    }
}

export async function deleteConfiguration(id: string) {
    try {
        await prisma.configuration.delete({
            where: { id }
        })

        revalidatePath("/admin/settings/configuration")
        return { success: true, message: "Configuration deleted successfully" }
    } catch (error) {
        console.error("Failed to delete configuration:", error)
        return { success: false, message: "Failed to delete configuration" }
    }
}

export async function getConfigurations() {
    try {
        const configs = await prisma.configuration.findMany({
            orderBy: { key: 'asc' },
        })
        return { success: true, data: configs }
    } catch (error) {
        console.error("Failed to get configurations:", error);
        return { success: false, data: [] }
    }
}

export async function getConfiguration(id: string) {
    try {
        const config = await prisma.configuration.findUnique({
            where: { id }
        })
        if (!config) return { success: false, message: "Configuration not found" }
        return { success: true, data: config }
    } catch (error) {
        console.error("Failed to get configuration:", error);
        return { success: false, message: "Failed to get configuration" }
    }
}
