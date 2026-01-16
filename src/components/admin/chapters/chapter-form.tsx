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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { chapterSchema, ChapterFormValues } from "@/lib/validations/chapter"
import { createChapter, updateChapter } from "@/lib/actions/chapter"
import { Chapter, District } from "@prisma/client"
import { states } from "@/lib/constants/states"

interface ChapterFormProps {
    initialData?: Chapter | null
    districts: District[]
    currentUser: any
}

export function ChapterForm({ initialData, districts, currentUser }: ChapterFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    const form = useForm<ChapterFormValues>({
        resolver: zodResolver(chapterSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            code: initialData.code || "",
            email: initialData.email || "",
            phone: initialData.phone || "",
            address: initialData.address || "",
            mailingAddress: initialData.mailingAddress || "",
            state: initialData.state || "",
            city: initialData.city || "",
            zipcode: initialData.zipcode || "",
            districtId: initialData.districtId,
        } : {
            name: "",
            code: "",
            email: "",
            phone: "",
            address: "",
            mailingAddress: "",
            state: "",
            city: "",
            zipcode: "",
            districtId: (!currentUser?.isSuperAdmin && currentUser?.districtId) ? currentUser.districtId : "",
        },
    })

    async function onSubmit(data: ChapterFormValues) {
        setIsLoading(true)

        try {
            if (initialData) {
                const res = await updateChapter(initialData.id, data)
                if (res.success) {
                    toast.success(res.message)
                    router.push("/admin/chapters")
                    router.refresh()
                } else {
                    toast.error(res.message)
                }
            } else {
                const res = await createChapter(data)
                if (res.success) {
                    toast.success(res.message)
                    router.push("/admin/chapters")
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
                                    {district.name} ({district.number})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {form.formState.errors.districtId && (
                        <p className="text-sm text-red-500">{form.formState.errors.districtId.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Chapter Name</Label>
                        <Input
                            id="name"
                            disabled={isLoading}
                            placeholder="e.g. Chapter Beta"
                            {...form.register("name")}
                        />
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="code">Code</Label>
                        <Input
                            id="code"
                            disabled={isLoading}
                            placeholder="e.g. CH-001"
                            {...form.register("code")}
                        />
                        {form.formState.errors.code && (
                            <p className="text-sm text-red-500">{form.formState.errors.code.message}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                            id="email"
                            type="email"
                            disabled={isLoading}
                            {...form.register("email")}
                        />
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                            id="phone"
                            disabled={isLoading}
                            {...form.register("phone")}
                        />
                        {form.formState.errors.phone && (
                            <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="address">Address (Optional)</Label>
                        <Input
                            id="address"
                            disabled={isLoading}
                            {...form.register("address")}
                        />
                        {form.formState.errors.address && (
                            <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="mailingAddress">Mailing Address</Label>
                        <Input
                            id="mailingAddress"
                            disabled={isLoading}
                            {...form.register("mailingAddress")}
                        />
                        {form.formState.errors.mailingAddress && (
                            <p className="text-sm text-red-500">{form.formState.errors.mailingAddress.message}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            disabled={isLoading}
                            {...form.register("city")}
                        />
                        {form.formState.errors.city && (
                            <p className="text-sm text-red-500">{form.formState.errors.city.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="state">State</Label>
                        <Select
                            disabled={isLoading}
                            onValueChange={(value) => form.setValue("state", value)}
                            defaultValue={form.watch("state")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                                {states.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                        {state.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.state && (
                            <p className="text-sm text-red-500">{form.formState.errors.state.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="zipcode">Zip Code</Label>
                        <Input
                            id="zipcode"
                            disabled={isLoading}
                            {...form.register("zipcode")}
                        />
                        {form.formState.errors.zipcode && (
                            <p className="text-sm text-red-500">{form.formState.errors.zipcode.message}</p>
                        )}
                    </div>
                </div>

            </div>
            <Button disabled={isLoading} type="submit">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Save changes" : "Create chapter"}
            </Button>
        </form>
    )
}
