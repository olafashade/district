import { DistrictForm } from "@/components/admin/districts/district-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewDistrictPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-4 gap-4">
                <Link href="/admin/districts">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Create District</h2>
            </div>
            <div className="grid gap-4 max-w-2xl">
                <DistrictForm />
            </div>
        </div>
    )
}
