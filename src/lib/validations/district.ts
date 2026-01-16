import { z } from "zod"

export const districtSchema = z.object({
    name: z.string().min(2, {
        message: "District name must be at least 2 characters.",
    }),
    number: z.string().max(10, {
        message: "District number must be at most 10 digits."
    }).min(1, "District number is required"),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }).optional().or(z.literal('')),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal('')),
    shieldUrl: z.string().optional(),
})

export type DistrictFormValues = z.infer<typeof districtSchema>
