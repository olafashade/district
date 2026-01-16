"use server"

import { userRegisterSchema } from "@/lib/validations/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { sendMail, replaceTemplate } from "@/lib/mail"
import emailTemplate from "@/templates/email"

export async function registerUser(data: z.infer<typeof userRegisterSchema>) {
    const validation = userRegisterSchema.safeParse(data)

    if (!validation.success) {
        return { success: false, message: "Invalid data", data: validation.error.flatten() }
    }

    const { email, password, firstName, middleName, lastName } = validation.data

    const existingUser = await prisma.user.findUnique({
        where: { email },
    })

    if (existingUser) {
        return { success: false, message: "User already exists", data: null }
    }

    const existingPending = await prisma.pendingRegistration.findUnique({
        where: { email },
    })

    const hashedPassword = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    if (existingPending) {
        await prisma.pendingRegistration.update({
            where: { email },
            data: {
                firstName,
                middleName,
                lastName,
                password: hashedPassword,
                verificationToken,
                expiresAt
            }
        })
    } else {
        await prisma.pendingRegistration.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                middleName,
                lastName,
                verificationToken,
                expiresAt
            },
        })
    }

    const verifyLink = `${process.env.SITE_URL}/verify-email?token=${verificationToken}`;

    console.log(verifyLink);
    const parameters = {
        GREETING: `Hello ${firstName},`,
        INTRO: "Please click the button below to verify your account:",
        LINK: verifyLink,
        BUTTON: "Verify Email",
        SUBJECT: "Verify your email address",
        EMAIL: email,
        MESSAGE: "If you did not request this, please ignore this email.",
    };

    const htmlBody = replaceTemplate(emailTemplate(true), parameters);

    await sendMail(htmlBody, parameters);

    return { success: true, message: "Verification email sent. Please check your inbox.", data: { email } }
}

export async function requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return { success: false, message: "User not found" }

    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 3600 * 1000) // 1 hour

    // Delete existing tokens for this email
    await prisma.verificationToken.deleteMany({
        where: { identifier: email },
    })

    await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires,
        },
    })

    const resetLink = `${process.env.SITE_URL}/reset-password?token=${token}`

    const parameters = {
        GREETING: `Hello ${user.firstName || 'User'},`,
        INTRO: "You requested a password reset. Please click the button below to reset your password:",
        LINK: resetLink,
        BUTTON: "Reset Password",
        SUBJECT: "Password Reset Request",
        EMAIL: email,
        MESSAGE: "If you did not request this, please ignore this email. The link will expire in 1 hour.",
    };

    const htmlBody = replaceTemplate(emailTemplate(true), parameters);
    await sendMail(htmlBody, parameters);

    return { success: true, message: "Password reset link sent to your email" }
}

const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export async function resetPassword(data: z.infer<typeof resetPasswordSchema>) {
    const validation = resetPasswordSchema.safeParse(data)
    if (!validation.success) {
        return { success: false, message: "Invalid data", data: validation.error.flatten() }
    }

    const { token, password } = validation.data

    const existingToken = await prisma.verificationToken.findUnique({
        where: { token },
    })

    if (!existingToken) {
        return { success: false, message: "Invalid token" }
    }

    if (new Date() > existingToken.expires) {
        await prisma.verificationToken.delete({ where: { token } })
        return { success: false, message: "Token has expired" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
        where: { email: existingToken.identifier },
        data: { password: hashedPassword },
    })

    await prisma.verificationToken.delete({ where: { token } })

    return { success: true, message: "Password reset successfully" }
}
