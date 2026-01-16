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
import { feeSchema, FeeFormValues } from "@/lib/validations/fee"
import { createFee, updateFee } from "@/lib/actions/fee"
import { Chapter, Fee } from "@prisma/client"

interface FeeFormProps {
    initialData?: Fee | null
    chapters: Chapter[]
    currentUser: any
}

export function FeeForm({ initialData, chapters, currentUser }: FeeFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    const form = useForm<FeeFormValues>({
        resolver: zodResolver(feeSchema) as any,
        defaultValues: initialData ? {
            name: initialData.name,
            abbreviation: initialData.abbreviation || "",
            amount: initialData.amount,
            chapterId: initialData.chapterId,
            membershipFee: initialData.membershipFee,
            newMembershipFee: initialData.newMembershipFee,
        } : {
            name: "",
            abbreviation: "",
            amount: 0,
            chapterId: (!currentUser?.isSuperAdmin && currentUser?.chapterId) ? currentUser.chapterId : "",
            membershipFee: false,
            newMembershipFee: false,
        },
    })

    async function onSubmit(data: FeeFormValues) {
        setIsLoading(true)

        try {
            if (initialData) {
                const res = await updateFee(initialData.id, data)
                if (res.success) {
                    toast.success(res.message)
                    router.push("/admin/settings/fees")
                    router.refresh()
                } else {
                    toast.error(res.message)
                }
            } else {
                const res = await createFee(data)
                if (res.success) {
                    toast.success(res.message)
                    router.push("/admin/settings/fees")
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
                        <Label htmlFor="name">Fee Name</Label>
                        <Input id="name" placeholder="Enter fee name" disabled={isLoading} {...form.register("name")} />
                        {form.formState.errors.name && (<p className="text-sm text-red-500">{form.formState.errors.name.message}</p>)}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="abbreviation">Abbreviation (Optional)</Label>
                        <Input id="abbreviation" placeholder="e.g. YEARLY" disabled={isLoading} {...form.register("abbreviation")} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            disabled={isLoading}
                            placeholder="0.00"
                            {...form.register("amount")}
                        />
                        {form.formState.errors.amount && (<p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>)}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="chapterId">Chapter</Label>
                        <Select
                            disabled={isLoading || (!currentUser?.isSuperAdmin && !!currentUser?.chapterId)}
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
                        {form.formState.errors.chapterId && (<p className="text-sm text-red-500">{form.formState.errors.chapterId.message}</p>)}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <Checkbox
                            id="membershipFee"
                            checked={form.watch("membershipFee")}
                            onCheckedChange={(checked) => form.setValue("membershipFee", checked as boolean)}
                            disabled={isLoading}
                        />
                        <Label htmlFor="membershipFee">Is Membership Fee?</Label>
                    </div>

                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <Checkbox
                            id="newMembershipFee"
                            checked={form.watch("newMembershipFee")}
                            onCheckedChange={(checked) => form.setValue("newMembershipFee", checked as boolean)}
                            disabled={isLoading}
                        />
                        <Label htmlFor="newMembershipFee">Is New Membership Fee?</Label>
                    </div>
                </div>
            </div>
            <Button disabled={isLoading} type="submit">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Save changes" : "Create Fee"}
            </Button>
        </form>
    )
}
