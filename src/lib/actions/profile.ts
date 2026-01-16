"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { sendMail, replaceTemplate } from "@/lib/mail"
import emailTemplate from "@/templates/email"
import { generateOTP } from "@/lib/utils"

const profileSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
})

const changePasswordSchema = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    otp: z.string().length(6, "OTP must be 6 digits"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export async function updateProfile(data: z.infer<typeof profileSchema>) {
    const session = await getServerSession(authOptions)
    if (!session) return { success: false, message: "Unauthorized" }

    const result = profileSchema.safeParse(data)
    if (!result.success) return { success: false, message: "Invalid data", error: result.error.flatten() }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                firstName: result.data.firstName,
                lastName: result.data.lastName,
                name: `${result.data.firstName} ${result.data.lastName}`
            }
        })
        revalidatePath("/profile")
        return { success: true, message: "Profile updated successfully" }
    } catch (error) {
        console.error("Profile update error:", error)
        return { success: false, message: "Failed to update profile" }
    }
}

export async function requestPasswordChangeOtp() {
    const session = await getServerSession(authOptions)
    if (!session) return { success: false, message: "Unauthorized" }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return { success: false, message: "User not found" }

    const otp = generateOTP(6)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 mins validity for usage

    await prisma.user.update({
        where: { id: user.id },
        data: {
            otpCode: otp,
            otpExpiresAt: expiresAt
        }
    })

    const parameters = {
        GREETING: `Hello ${user.firstName || user.name || 'User'},`,
        INTRO: "You requested a password change. Please use the verification code below to proceed:",
        SUBJECT: "Password Change Authorization",
        EMAIL: user.email,
        MESSAGE: `Your OTP Code is: <b>${otp}</b>. It expires in 15 minutes.`,
    };

    const htmlBody = replaceTemplate(emailTemplate(false), parameters);

    await sendMail(htmlBody, parameters);

    return { success: true, message: "OTP sent to your email" }
}

export async function changePasswordWithOtp(data: z.infer<typeof changePasswordSchema>) {
    const session = await getServerSession(authOptions)
    if (!session) return { success: false, message: "Unauthorized" }

    const result = changePasswordSchema.safeParse(data)
    if (!result.success) return { success: false, message: "Invalid data", error: result.error.flatten() }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return { success: false, message: "User not found" }

    if (!user.otpCode || !user.otpExpiresAt || user.otpCode !== result.data.otp || new Date() > user.otpExpiresAt) {
        return { success: false, message: "Invalid or expired OTP" }
    }

    const hashedPassword = await bcrypt.hash(result.data.newPassword, 10)

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            otpCode: null,
            otpExpiresAt: null
        }
    })

    return { success: true, message: "Password changed successfully" }
}
