"use server"

import { prisma } from "@/lib/db"

interface VerifyEmailResult {
    success: boolean
    message: string
}

export async function verifyEmail(token: string): Promise<VerifyEmailResult> {
    const pendingUser = await prisma.pendingRegistration.findUnique({
        where: { verificationToken: token },
    })

    if (!pendingUser) {
        return { success: false, message: "Invalid or expired token" }
    }

    if (new Date() > pendingUser.expiresAt) {
        return { success: false, message: "Token expired" }
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: pendingUser.email }
    })

    if (existingUser) {
        // Should not happen theoretically unless race condition or manual insertion
        return { success: false, message: "User already exists" }
    }

    // Create real user
    await prisma.user.create({
        data: {
            email: pendingUser.email,
            firstName: pendingUser.firstName,
            middleName: pendingUser.middleName,
            lastName: pendingUser.lastName,
            password: pendingUser.password, // Already hashed
            name: `${pendingUser.firstName} ${pendingUser.lastName}`,
            emailVerified: new Date(),
            role: "USER", // Default role
        },
    })

    // Cleanup pending
    await prisma.pendingRegistration.delete({
        where: { id: pendingUser.id },
    })

    return { success: true, message: "Email verified successfully. You can now login." }
}
