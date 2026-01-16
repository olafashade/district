import { RoleForm } from "@/components/admin/settings/roles/role-form"
import { getDistricts } from "@/lib/actions/district"
import { getRole } from "@/lib/actions/role"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface EditRolePageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditRolePage({ params }: EditRolePageProps) {
    const { id: roleId } = await params
    if (!roleId) return notFound()

    const session = await getServerSession(authOptions)

    const [roleRes, districtsRes] = await Promise.all([
        getRole(roleId),
        getDistricts()
    ])

    if (!roleRes.success || !roleRes.data) {
        notFound()
    }

    const role = roleRes.data
    const districts = districtsRes.data || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/settings/roles">
                    <Button variant="outline" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Edit Role</h2>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:max-w-2xl">
                <RoleForm initialData={role} districts={districts} currentUser={session?.user} />
            </div>
        </div>
    )
}
