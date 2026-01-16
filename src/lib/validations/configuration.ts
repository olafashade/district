import { z } from "zod"

export const configurationSchema = z.object({
    key: z.string().min(1, { message: "Key is required" }),
    value: z.string().min(1, { message: "Value is required" }),
})

export type ConfigurationFormValues = z.infer<typeof configurationSchema>
