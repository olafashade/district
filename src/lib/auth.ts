export const runtime = 'nodejs';
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                    include: {
                        userRole: true,
                        district: true
                    }
                })

                if (!user || !user.password) {
                    return null
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    return null
                }

                const rolePrivileges = user.userRole?.privileges || []
                const privileges = Array.from(new Set([...user.privileges, ...rolePrivileges]))

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role as any,
                    districtId: user.districtId,
                    chapterId: user.chapterId,
                    isSuperAdmin: (user as any).isSuperAdmin,
                    privileges: privileges,
                    districtShield: user.district?.shieldUrl || null,
                    firstName: user.firstName,
                    lastName: user.lastName,
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token) {
                if (session.user) {
                    session.user.id = token.id as string
                    session.user.name = token.name
                    session.user.email = token.email
                        ; (session.user as any).role = token.role
                        ; (session.user as any).districtId = token.districtId
                        ; (session.user as any).chapterId = token.chapterId
                        ; (session.user as any).isSuperAdmin = token.isSuperAdmin
                        ; (session.user as any).privileges = token.privileges
                        ; (session.user as any).districtShield = token.districtShield
                        ; (session.user as any).firstName = token.firstName
                        ; (session.user as any).lastName = token.lastName
                }
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role
                token.districtId = (user as any).districtId
                token.chapterId = (user as any).chapterId
                token.isSuperAdmin = (user as any).isSuperAdmin
                token.privileges = (user as any).privileges
                token.districtShield = (user as any).districtShield
                token.firstName = (user as any).firstName
                token.lastName = (user as any).lastName
            }
            return token
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
}
