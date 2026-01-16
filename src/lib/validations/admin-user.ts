import { z } from "zod"

export const adminUserSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    middleName: z.string().optional(),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z.string().optional(),
    roleId: z.string().min(1, { message: "Role is required" }),
    districtId: z.string().optional(),
    chapterId: z.string().optional(),
    isSuperAdmin: z.boolean().default(false).optional(),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type AdminUserFormValues = z.infer<typeof adminUserSchema>
