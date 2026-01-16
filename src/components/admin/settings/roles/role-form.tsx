"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { roleSchema, RoleFormValues, PRIVILEGES } from "@/lib/validations/role"
import { createRole, updateRole } from "@/lib/actions/role"
import { District, Role } from "@prisma/client"

interface RoleFormProps {
    initialData?: Role | null
    districts: District[]
    currentUser: any
}

export function RoleForm({ initialData, districts, currentUser }: RoleFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema) as any,
        defaultValues: initialData ? {
            name: initialData.name,
            abbreviation: initialData.abbreviation || "",
            privileges: initialData.privileges,
            districtId: initialData.districtId,
        } : {
            name: "",
            abbreviation: "",
            privileges: [],
            districtId: (!currentUser?.isSuperAdmin && currentUser?.districtId) ? currentUser.districtId : "",
        },
    })

    async function onSubmit(data: RoleFormValues) {
        setIsLoading(true)

        try {
            if (initialData) {
                const res = await updateRole(initialData.id, data)
                if (res.success) {
                    toast.success(res.message)
                    router.push("/admin/settings/roles")
                    router.refresh()
                } else {
                    toast.error(res.message)
                }
            } else {
                const res = await createRole(data)
                if (res.success) {
                    toast.success(res.message)
                    router.push("/admin/settings/roles")
                    router.refresh()
                } else {
                    toast.error(res.message)
                }
            }

        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Role Name</Label>
                        <Input id="name" placeholder="Enter role name" disabled={isLoading} {...form.register("name")} />
                        {form.formState.errors.name && (<p className="text-sm text-red-500">{form.formState.errors.name.message}</p>)}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="abbreviation">Abbreviation (Optional)</Label>
                        <Input id="abbreviation" placeholder="e.g. FIN_MGR" disabled={isLoading} {...form.register("abbreviation")} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="districtId">District</Label>
                    <Select
                        disabled={isLoading || (!currentUser?.isSuperAdmin && !!currentUser?.districtId)}
                        onValueChange={(value) => form.setValue("districtId", value)}
                        defaultValue={form.watch("districtId")}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a district" />
                        </SelectTrigger>
                        <SelectContent>
                            {districts.map((district) => (
                                <SelectItem key={district.id} value={district.id}>
                                    {district.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {form.formState.errors.districtId && (<p className="text-sm text-red-500">{form.formState.errors.districtId.message}</p>)}
                </div>

                <div className="grid gap-2">
                    <Label className="mb-2">Privileges</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-md">
                        {PRIVILEGES.map((privilege) => {
                            if (privilege === 'Super Admin' && !currentUser?.isSuperAdmin) {
                                return null;
                            }
                            return (
                                <div key={privilege} className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={form.watch("privileges")?.includes(privilege)}
                                        onCheckedChange={(checked) => {
                                            const current = form.watch("privileges") || [] // Ensure array

                                            if (checked) {
                                                if (privilege === 'Super Admin') {
                                                    // @ts-ignore
                                                    return form.setValue("privileges", [...PRIVILEGES])
                                                }
                                                if (privilege === 'Admin') {
                                                    // @ts-ignore
                                                    // If Super Admin was already selected, do we keep it? 
                                                    // Prompt says: "When Admin is selected, select everyting aside Super Admin". 
                                                    // Can interpret as SET state to All \ {Super Admin}.
                                                    return form.setValue("privileges", PRIVILEGES.filter(p => p !== 'Super Admin'))
                                                }
                                                return form.setValue("privileges", [...current, privilege])
                                            } else {
                                                return form.setValue("privileges", current.filter((value) => value !== privilege))
                                            }
                                        }}
                                    />
                                    <Label className="font-normal">{privilege}</Label>
                                </div>
                            )
                        })}
                    </div>
                    {form.formState.errors.privileges && (<p className="text-sm text-red-500">{form.formState.errors.privileges.message}</p>)}
                </div>
            </div>
            <Button disabled={isLoading} type="submit">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Save changes" : "Create Role"}
            </Button>
        </form>
    )
}
