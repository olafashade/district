import { MemberForm } from "@/components/admin/members/member-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getDistricts } from "@/lib/actions/district"
import { getChapters } from "@/lib/actions/chapter"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function NewMemberPage() {
    const session = await getServerSession(authOptions)
    const [districtsResult, chaptersResult] = await Promise.all([
        getDistricts(),
        getChapters()
    ])

    const districts = districtsResult.data || []
    const chapters = chaptersResult.data || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-4 gap-4">
                <Link href="/admin/members">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Create Member</h2>
            </div>
            <div className="grid gap-4 max-w-4xl">
                <MemberForm districts={districts} chapters={chapters} currentUser={session?.user as any} />
            </div>
        </div>
    )
}
