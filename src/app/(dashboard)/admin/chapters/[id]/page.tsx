import { ChapterForm } from "@/components/admin/chapters/chapter-form"
import { getChapter } from "@/lib/actions/chapter"
import { getDistricts } from "@/lib/actions/district"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface ChapterUpdatePageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ChapterUpdatePage(props: ChapterUpdatePageProps) {
    const params = await props.params;
    const { id } = params;

    const session = await getServerSession(authOptions)

    const [chapterResult, districtsResult] = await Promise.all([
        getChapter(id),
        getDistricts()
    ])

    if (!chapterResult.success || !chapterResult.data) {
        notFound()
    }

    const districts = districtsResult.data || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-4 gap-4">
                <Link href="/admin/chapters">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Edit Chapter</h2>
            </div>
            <div className="grid gap-4 max-w-2xl">
                <ChapterForm initialData={chapterResult.data} districts={districts} currentUser={session?.user} />
            </div>
        </div>
    )
}
