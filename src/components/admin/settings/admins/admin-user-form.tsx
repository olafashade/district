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
import { adminUserSchema, AdminUserFormValues } from "@/lib/validations/admin-user"
import { createAdminUser } from "@/lib/actions/admin-user"
import { Role, District, Chapter } from "@prisma/client"

interface AdminUserFormProps {
    roles: Role[]
    districts: District[]
    chapters: Chapter[]
    currentUser: any
}

export function AdminUserForm({ roles, districts, chapters, currentUser }: AdminUserFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    const form = useForm<AdminUserFormValues>({
        resolver: zodResolver(adminUserSchema),
        defaultValues: {
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            phone: "",
            roleId: "",
            districtId: "",
            chapterId: "",
            password: "",
            confirmPassword: "",
            isSuperAdmin: false,
        },
    })

    async function onSubmit(data: AdminUserFormValues) {
        setIsLoading(true)

        try {
            const res = await createAdminUser(data)
            if (res.success) {
                toast.success(res.message)
                router.push("/admin/settings/admins")
                router.refresh()
            } else {
                toast.error(res.message)
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
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="First Name" disabled={isLoading} {...form.register("firstName")} />
                        {form.formState.errors.firstName && (<p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>)}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Last Name" disabled={isLoading} {...form.register("lastName")} />
                        {form.formState.errors.lastName && (<p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>)}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="middleName">Middle Name (Optional)</Label>
                        <Input id="middleName" placeholder="Middle Name" disabled={isLoading} {...form.register("middleName")} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Email Address" disabled={isLoading} {...form.register("email")} />
                        {form.formState.errors.email && (<p className="text-sm text-red-500">{form.formState.errors.email.message}</p>)}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input id="phone" placeholder="Phone Number" disabled={isLoading} {...form.register("phone")} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="roleId">Role</Label>
                        <Select
                            disabled={isLoading}
                            onValueChange={(value) => form.setValue("roleId", value)}
                            defaultValue={form.watch("roleId")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.roleId && (<p className="text-sm text-red-500">{form.formState.errors.roleId.message}</p>)}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="districtId">District (Optional)</Label>
                        <Select
                            disabled={isLoading}
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
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="chapterId">Chapter (Optional)</Label>
                        <Select
                            disabled={isLoading}
                            onValueChange={(value) => form.setValue("chapterId", value)}
                            defaultValue={form.watch("chapterId")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a chapter" />
                            </SelectTrigger>
                            <SelectContent>
                                {chapters.map((chapter) => (
                                    <SelectItem key={chapter.id} value={chapter.id}>
                                        {chapter.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="Password" disabled={isLoading} {...form.register("password")} />
                        {form.formState.errors.password && (<p className="text-sm text-red-500">{form.formState.errors.password.message}</p>)}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" placeholder="Confirm Password" disabled={isLoading} {...form.register("confirmPassword")} />
                        {form.formState.errors.confirmPassword && (<p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>)}
                    </div>
                </div>

                {currentUser?.isSuperAdmin && (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isSuperAdmin"
                            onCheckedChange={(checked) => form.setValue("isSuperAdmin", !!checked)}
                            checked={form.watch("isSuperAdmin") || false}
                        />
                        <Label htmlFor="isSuperAdmin">Is Super Admin?</Label>
                    </div>
                )}
            </div>
            <Button disabled={isLoading} type="submit">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Admin User
            </Button>
        </form>
    )
}
