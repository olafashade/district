import { RoleForm } from "@/components/admin/settings/roles/role-form"
import { getDistricts } from "@/lib/actions/district"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function NewRolePage() {
    const session = await getServerSession(authOptions)
    const districtsRes = await getDistricts()
    const districts = districtsRes.data || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/settings/roles">
                    <Button variant="outline" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Create Role</h2>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:max-w-2xl">
                <RoleForm districts={districts} currentUser={session?.user as any} />
            </div>
        </div>
    )
}
