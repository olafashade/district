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
import { districtSchema, DistrictFormValues } from "@/lib/validations/district"
import { createDistrict, updateDistrict } from "@/lib/actions/district"
import { uploadFileAction } from "@/lib/actions/upload"
import { District } from "@prisma/client"

interface DistrictFormProps {
    initialData?: District | null
}

export function DistrictForm({ initialData }: DistrictFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [file, setFile] = React.useState<File | null>(null)
    const [preview, setPreview] = React.useState<string | null>(initialData?.shieldUrl || null)

    const form = useForm<DistrictFormValues>({
        resolver: zodResolver(districtSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            number: initialData.number,
            email: initialData.email || "",
            phone: initialData.phone || "",
            shieldUrl: initialData.shieldUrl || "",
        } : {
            name: "",
            number: "",
            email: "",
            phone: "",
            shieldUrl: "",
        },
    })

    async function onSubmit(data: DistrictFormValues) {
        setIsLoading(true)

        try {
            let finalData = { ...data }

            if (file) {
                const formData = new FormData()
                formData.append("file", file)
                const uploadRes = await uploadFileAction(formData)
                if (uploadRes.success && uploadRes.url) {
                    finalData.shieldUrl = uploadRes.url
                } else {
                    toast.error("Image upload failed")
                    setIsLoading(false)
                    return
                }
            }

            if (initialData) {
                const res = await updateDistrict(initialData.id, finalData)
                if (res.success) {
                    toast.success(res.message)
                    router.push("/admin/districts")
                    router.refresh()
                } else {
                    toast.error(res.message)
                }
            } else {
                const res = await createDistrict(finalData)
                if (res.success) {
                    toast.success(res.message)
                    router.push("/admin/districts")
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
                    <Label htmlFor="name">District Name</Label>
                    <Input
                        id="name"
                        disabled={isLoading}
                        placeholder="e.g. District Alpha"
                        {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                        <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="number">District Number</Label>
                    <Input
                        id="number"
                        disabled={isLoading}
                        placeholder="e.g. 9110"
                        maxLength={10}
                        {...form.register("number")}
                    />
                    {form.formState.errors.number && (
                        <p className="text-sm text-red-500">{form.formState.errors.number.message}</p>
                    )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">District Email (Optional)</Label>
                    <Input
                        id="email"
                        type="email"
                        disabled={isLoading}
                        placeholder="district@example.com"
                        {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                        <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                    )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                        id="phone"
                        disabled={isLoading}
                        placeholder="+1234567890"
                        {...form.register("phone")}
                    />
                    {form.formState.errors.phone && (
                        <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                    )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="shield">Shield Image</Label>
                    <Input
                        id="shield"
                        type="file"
                        accept="image/*"
                        disabled={isLoading}
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                const selectedFile = e.target.files[0]
                                setFile(selectedFile)
                                // Create object URL for preview
                                const previewUrl = URL.createObjectURL(selectedFile)
                                setPreview(previewUrl)
                            }
                        }}
                    />
                    {preview && (
                        <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">
                                {file ? "New Shield Preview:" : "Current Shield:"}
                            </p>
                            <img
                                src={preview}
                                alt="Shield Preview"
                                className="w-24 h-24 object-contain border rounded bg-slate-50"
                            />
                        </div>
                    )}
                </div>
            </div>
            <Button disabled={isLoading} type="submit">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Save changes" : "Create district"}
            </Button>
        </form>
    )
}
