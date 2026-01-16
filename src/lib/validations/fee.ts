import { z } from "zod"

export const feeSchema = z.object({
    name: z.string().min(2, { message: "Fee name is required" }),
    abbreviation: z.string().optional(),
    amount: z.coerce.number().min(0, { message: "Amount must be positive" }),
    chapterId: z.string().min(1, { message: "Chapter is required" }),
    membershipFee: z.boolean().default(false),
    newMembershipFee: z.boolean().default(false),
})

export type FeeFormValues = z.infer<typeof feeSchema>
