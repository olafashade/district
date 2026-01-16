import * as z from "zod"

export const userAuthSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters long.",
    }),
})

export const userRegisterSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z
        .string()
        .min(10, { message: "Password must be at least 10 characters long." })
        .regex(/\d/, { message: "Password must contain at least one number." })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
    firstName: z
        .string()
        .min(2, { message: "First name must be at least 2 characters long." })
        .regex(/^[A-Za-z'-]+$/, { message: "First name can only contain alphabets, apostrophes, and hyphens." }),
    middleName: z
        .string()
        .regex(/^[A-Za-z'-]*$/, { message: "Middle name can only contain alphabets, apostrophes, and hyphens." })
        .optional(),
    lastName: z
        .string()
        .min(2, { message: "Last name must be at least 2 characters long." })
        .regex(/^[A-Za-z'-]+$/, { message: "Last name can only contain alphabets, apostrophes, and hyphens." }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})
