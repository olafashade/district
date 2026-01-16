import { z } from "zod"

export const chapterSchema = z.object({
    name: z.string().min(2, {
        message: "Chapter name must be at least 2 characters.",
    }),
    code: z.string().min(1, {
        message: "Chapter code is required."
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }).optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    mailingAddress: z.string().min(1, {
        message: "Mailing address is required."
    }),
    state: z.string().optional(),
    city: z.string().optional(),
    zipcode: z.string().optional(),
    districtId: z.string().min(1, {
        message: "District is required."
    }),
})

export type ChapterFormValues = z.infer<typeof chapterSchema>
