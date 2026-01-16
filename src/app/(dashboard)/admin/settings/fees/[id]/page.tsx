import { FeeForm } from "@/components/admin/settings/fees/fee-form"
import { getChapters } from "@/lib/actions/chapter"
import { getFee } from "@/lib/actions/fee"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface EditFeePageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditFeePage({ params }: EditFeePageProps) {
    const { id: feeId } = await params
    if (!feeId) return notFound()

    const session = await getServerSession(authOptions)

    const [feeRes, chaptersRes] = await Promise.all([
        getFee(feeId),
        getChapters()
    ])

    if (!feeRes.success || !feeRes.data) {
        notFound()
    }

    const fee = feeRes.data
    const chapters = chaptersRes.data || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/settings/fees">
                    <Button variant="outline" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Edit Fee</h2>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:max-w-2xl">
                <FeeForm initialData={fee} chapters={chapters} currentUser={session?.user} />
            </div>
        </div>
    )
}
