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
import { configurationSchema, ConfigurationFormValues } from "@/lib/validations/configuration"
import { createConfiguration, updateConfiguration } from "@/lib/actions/configuration"
import { Configuration } from "@prisma/client"

interface ConfigurationFormProps {
    initialData?: Configuration | null
}

export function ConfigurationForm({ initialData }: ConfigurationFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    const form = useForm<ConfigurationFormValues>({
        resolver: zodResolver(configurationSchema),
        defaultValues: initialData ? {
            key: initialData.key,
            value: initialData.value,
        } : {
            key: "",
            value: "",
        },
    })

    async function onSubmit(data: ConfigurationFormValues) {
        setIsLoading(true)

        try {
            if (initialData) {
                const res = await updateConfiguration(initialData.id, data)
                if (res.success) {
                    toast.success(res.message)
                    router.push("/admin/settings/configuration")
                    router.refresh()
                } else {
                    toast.error(res.message)
                }
            } else {
                const res = await createConfiguration(data)
                if (res.success) {
                    toast.success(res.message)
                    router.push("/admin/settings/configuration")
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
                    <Label htmlFor="key">Key</Label>
                    <Input id="key" placeholder="Enter key (e.g. SITE_NAME)" disabled={isLoading} {...form.register("key")} />
                    {form.formState.errors.key && (<p className="text-sm text-red-500">{form.formState.errors.key.message}</p>)}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="value">Value</Label>
                    <Input id="value" placeholder="Enter value" disabled={isLoading} {...form.register("value")} />
                    {form.formState.errors.value && (<p className="text-sm text-red-500">{form.formState.errors.value.message}</p>)}
                </div>
            </div>
            <Button disabled={isLoading} type="submit">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Save changes" : "Create Configuration"}
            </Button>
        </form>
    )
}
