import { z } from "zod"

export const memberSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    firstName: z.string().min(2, { message: "First name is required" }),
    lastName: z.string().min(2, { message: "Last name is required" }),
    middleName: z.string().optional(),

    phone: z.string().optional(),
    mailingAddress: z.string().optional(),
    mailingAddress2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipcode: z.string().optional(),

    districtId: z.string().min(1, { message: "District is required" }),
    chapterId: z.string().min(1, { message: "Chapter is required" }),
    initiationChapterId: z.string().optional(), // Can be optional if not in list, but user said selection.

    controlNumber: z.string().min(1, { message: "Control number is required" }),
    initiationYear: z.coerce.number().min(1900, { message: "Please enter a valid year" }).max(new Date().getFullYear(), { message: "Year cannot be in the future" }).optional(),

    role: z.enum(["ADMIN", "USER"]),
    memberType: z.enum(["STUDENT", "NON_STUDENT"]).optional(),
})

export type MemberFormValues = z.infer<typeof memberSchema>
