import { z } from "zod"

export const PRIVILEGES = [
    'Super Admin',
    'Admin',
    'Manage District',
    'Manage Chapter',
    'Manage User',
    'Manage Member',
    'Manage Payment',
    'Reporting',
    'Manage Roles',
] as const

export const roleSchema = z.object({
    name: z.string().min(2, { message: "Role name is required" }),
    abbreviation: z.string().optional(),
    privileges: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one privilege.",
    }),
    districtId: z.string().min(1, { message: "District is required" }),
})

export type RoleFormValues = z.infer<typeof roleSchema>
