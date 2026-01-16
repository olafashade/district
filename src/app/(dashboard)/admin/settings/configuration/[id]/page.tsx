import { ConfigurationForm } from "@/components/admin/settings/configuration/configuration-form"
import { getConfiguration } from "@/lib/actions/configuration"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface EditConfigurationPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditConfigurationPage({ params }: EditConfigurationPageProps) {
    const { id: configId } = await params
    if (!configId) return notFound()

    const result = await getConfiguration(configId)

    if (!result.success || !result.data) {
        notFound()
    }

    const config = result.data

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/settings/configuration">
                    <Button variant="outline" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Edit Configuration</h2>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:max-w-2xl">
                <ConfigurationForm initialData={config} />
            </div>
        </div>
    )
}
