"use server"

import { prisma } from "@/lib/db"
import { memberSchema } from "@/lib/validations/member"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { hash } from "bcryptjs"
import { UserRole, MemberType } from "@prisma/client"

export async function createMember(data: z.infer<typeof memberSchema>) {
    const result = memberSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "Invalid data", error: result.error.flatten() }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: result.data.email }
    })

    if (existingUser) {
        if (existingUser.deletedAt) {
            // If soft deleted, maybe restore? For now error.
            return { success: false, message: "User with this email already exists (deleted)." }
        }
        return { success: false, message: "User with this email already exists." }
    }

    // Check if control number exists
    const existingControlNumber = await prisma.user.findFirst({
        where: { controlNumber: result.data.controlNumber }
    })

    if (existingControlNumber) {
        return { success: false, message: "User with this control number already exists." }
    }


    try {
        // Generate a default password or random one. 
        // Ideally user sets it via email invite, but for now we set a default or random.
        // Let's set a default one for now: "ChangeMe123!"
        const hashedPassword = await hash("ChangeMe123!", 12)

        const user = await prisma.user.create({
            data: {
                email: result.data.email,
                password: hashedPassword,
                role: result.data.role as UserRole,
                firstName: result.data.firstName,
                lastName: result.data.lastName,
                middleName: result.data.middleName || null,
                phone: result.data.phone || null,
                mailingAddress: result.data.mailingAddress || null,
                mailingAddress2: result.data.mailingAddress2 || null,
                city: result.data.city || null,
                state: result.data.state || null,
                zipcode: result.data.zipcode || null,
                controlNumber: result.data.controlNumber,
                initiationYear: result.data.initiationYear || null,
                memberType: result.data.memberType as MemberType || null,

                districtId: result.data.districtId,
                chapterId: result.data.chapterId,
                initiationChapterId: result.data.initiationChapterId || null,
            },
        })

        revalidatePath("/admin/members")
        return { success: true, message: "Member created successfully", data: user }
    } catch (error) {
        console.error("Failed to create member:", error)
        return { success: false, message: "Failed to create member" }
    }
}

export async function updateMember(id: string, data: z.infer<typeof memberSchema>) {
    const result = memberSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "Invalid data", error: result.error.flatten() }
    }

    try {
        const user = await prisma.user.update({
            where: { id },
            data: {
                email: result.data.email,
                role: result.data.role as UserRole,
                firstName: result.data.firstName,
                lastName: result.data.lastName,
                middleName: result.data.middleName || null,
                phone: result.data.phone || null,
                mailingAddress: result.data.mailingAddress || null,
                mailingAddress2: result.data.mailingAddress2 || null,
                city: result.data.city || null,
                state: result.data.state || null,
                zipcode: result.data.zipcode || null,
                controlNumber: result.data.controlNumber,
                initiationYear: result.data.initiationYear || null,
                memberType: result.data.memberType as MemberType || null,

                districtId: result.data.districtId,
                chapterId: result.data.chapterId,
                initiationChapterId: result.data.initiationChapterId || null,
            }
        })

        revalidatePath("/admin/members")
        return { success: true, message: "Member updated successfully", data: user }
    } catch (error) {
        console.error("Failed to update member:", error)
        return { success: false, message: "Failed to update member" }
    }
}

export async function deleteMember(id: string) {
    try {
        // Soft delete
        await prisma.user.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        })

        revalidatePath("/admin/members")
        return { success: true, message: "Member deleted successfully" }
    } catch (error) {
        console.error("Failed to delete member:", error)
        return { success: false, message: "Failed to delete member" }
    }
}

interface GetMembersParams {
    page?: number
    limit?: number
    search?: string
    districtId?: string
    chapterId?: string
}

export async function getMembers({ page = 1, limit = 10, search, districtId, chapterId }: GetMembersParams = {}) {
    try {
        const skip = (page - 1) * limit

        const where: any = {
            deletedAt: null
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { controlNumber: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (districtId && districtId !== "all") where.districtId = districtId
        if (chapterId && chapterId !== "all") where.chapterId = chapterId

        const [members, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    district: true,
                    chapter: true
                }
            }),
            prisma.user.count({ where })
        ])

        return {
            success: true,
            data: members,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        console.error("Failed to get members:", error);
        return { success: false, data: [] }
    }
}

export async function getMember(id: string) {
    try {
        const member = await prisma.user.findUnique({
            where: { id },
            include: {
                district: true,
                chapter: true,
                initiationChapter: true
            }
        })
        if (!member) return { success: false, message: "Member not found" }
        return { success: true, data: member }
    } catch (error) {
        console.error("Failed to get member:", error);
        return { success: false, message: "Failed to get member" }
    }
}
