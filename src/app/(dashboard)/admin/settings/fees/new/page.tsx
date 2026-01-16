import { FeeForm } from "@/components/admin/settings/fees/fee-form"
import { getChapters } from "@/lib/actions/chapter"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function NewFeePage() {
    const session = await getServerSession(authOptions)
    const chaptersRes = await getChapters()
    const chapters = chaptersRes.data || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/settings/fees">
                    <Button variant="outline" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Create Fee</h2>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:max-w-2xl">
                <FeeForm chapters={chapters} currentUser={session?.user as any} />
            </div>
        </div>
    )
}
