import { ChapterForm } from "@/components/admin/chapters/chapter-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getDistricts } from "@/lib/actions/district"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function NewChapterPage() {
    const session = await getServerSession(authOptions)
    const districtsResult = await getDistricts()
    const districts = districtsResult.data || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-4 gap-4">
                <Link href="/admin/chapters">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Create Chapter</h2>
            </div>
            <div className="grid gap-4 max-w-2xl">
                <ChapterForm districts={districts} currentUser={session?.user as any} />
            </div>
        </div>
    )
}
