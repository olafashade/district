import { AdminUserForm } from "@/components/admin/settings/admins/admin-user-form"
import { getRoles } from "@/lib/actions/role"
import { getDistricts } from "@/lib/actions/district"
import { getChapters } from "@/lib/actions/chapter"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function NewAdminUserPage() {
    const session = await getServerSession(authOptions)
    const currentUser = session?.user

    const [rolesRes, districtsRes, chaptersRes] = await Promise.all([
        getRoles(),
        getDistricts(),
        getChapters()
    ])

    const roles = rolesRes.data || []
    const districts = districtsRes.data || []
    // @ts-ignore
    const chapters = chaptersRes.data || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/settings/admins">
                    <Button variant="outline" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Create Admin User</h2>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:max-w-3xl">
                <AdminUserForm roles={roles} districts={districts} chapters={chapters} currentUser={currentUser as any} />
            </div>
        </div>
    )
}
