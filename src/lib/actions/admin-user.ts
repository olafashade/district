"use server"

import { prisma } from "@/lib/db"
import { adminUserSchema } from "@/lib/validations/admin-user"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { sendMail, replaceTemplate } from "@/lib/mail"
import emailTemplate from "@/templates/email"


export async function createAdminUser(data: z.infer<typeof adminUserSchema>) {
    const result = adminUserSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "Invalid data", error: result.error.flatten() }
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: result.data.email }
        })

        if (existingUser) {
            return { success: false, message: "User with this email already exists" }
        }

        const hashedPassword = await bcrypt.hash(result.data.password, 10)

        const user = await prisma.user.create({
            data: {
                firstName: result.data.firstName,
                middleName: result.data.middleName,
                lastName: result.data.lastName,
                email: result.data.email,
                phone: result.data.phone,
                password: hashedPassword,
                role: "ADMIN",
                userRoleId: result.data.roleId,
                districtId: result.data.districtId || null,
                chapterId: result.data.chapterId || null,
                isSuperAdmin: result.data.isSuperAdmin || false,
                emailVerified: new Date(),
            },
        })

        const parameters = {
            GREETING: `Hello ${result.data.firstName},`,
            INTRO: "Welcome to the District Portal. An administrator account has been successfully created for you.",
            MESSAGE: `
                <p>You have been granted admin access to manage district operations.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0; font-weight: bold;">Your Login Credentials:</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${result.data.email}</p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> ${result.data.password}</p>
                </div>
                <p>Please log in and change your password immediately to secure your account.</p>
                <p>If you have any questions, please contact the support team.</p>
            `,
            BUTTON: "Login Now",
            LINK: `${process.env.SITE_URL}/login`,
            EMAIL: result.data.email,
            SUBJECT: "Your Admin Account Credentials"
        }

        const htmlBody = replaceTemplate(emailTemplate(true), parameters)

        await sendMail(htmlBody, parameters)

        revalidatePath("/admin/settings/admins")
        return { success: true, message: "Admin user created successfully", data: user }
    } catch (error) {
        console.error("Failed to create admin user:", error)
        return { success: false, message: "Failed to create admin user" }
    }
}

export async function getAdminUsers() {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: "ADMIN",
                deletedAt: null
            },
            include: {
                userRole: true
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: users }
    } catch (error) {
        console.error("Failed to get admin users:", error)
        return { success: false, data: [] }
    }
}

export async function deleteAdminUser(id: string) {
    try {
        await prisma.user.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        })
        revalidatePath("/admin/settings/admins")
        return { success: true, message: "Admin user deleted successfully" }
    } catch (error) {
        console.error("Failed to delete admin user:", error)
        return { success: false, message: "Failed to delete admin user" }
    }
}
