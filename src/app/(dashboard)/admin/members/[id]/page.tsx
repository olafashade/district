import { MemberForm } from "@/components/admin/members/member-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getDistricts } from "@/lib/actions/district"
import { getChapters } from "@/lib/actions/chapter"
import { getMember } from "@/lib/actions/member"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface MemberUpdatePageProps {
    params: Promise<{
        id: string
    }>
}

export default async function MemberUpdatePage(props: MemberUpdatePageProps) {
    const params = await props.params;
    const { id } = params;

    const session = await getServerSession(authOptions)

    const [memberResult, districtsResult, chaptersResult] = await Promise.all([
        getMember(id),
        getDistricts(),
        getChapters()
    ])

    if (!memberResult.success || !memberResult.data) {
        notFound()
    }

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
                <h2 className="text-3xl font-bold tracking-tight">Edit Member</h2>
            </div>
            <div className="grid gap-4 max-w-4xl">
                <MemberForm initialData={memberResult.data} districts={districts} chapters={chapters} currentUser={session?.user} />
            </div>
        </div>
    )
}
