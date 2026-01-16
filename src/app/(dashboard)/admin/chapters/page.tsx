import { Button } from "@/components/ui/button"
import { getChapters } from "@/lib/actions/chapter"
import { Plus } from "lucide-react"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ChapterActions } from "@/components/admin/chapters/chapter-actions"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function ChaptersPage() {
    const session = await getServerSession(authOptions)
    const user = session?.user as any
    const filterDistrictId = user?.isSuperAdmin ? undefined : user?.districtId

    const result = await getChapters(filterDistrictId)
    const chapters = result.data || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Chapters</h2>
                <div className="flex items-center space-x-2">
                    <Link href="/admin/chapters/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Chapter
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {chapters.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    No chapters found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            chapters.map((chapter) => (
                                <TableRow key={chapter.id}>
                                    <TableCell className="font-medium">{chapter.name}</TableCell>
                                    <TableCell>{chapter.code}</TableCell>
                                    <TableCell>{chapter.email || "-"}</TableCell>
                                    <TableCell>{(chapter as any).district?.name || "-"}</TableCell>
                                    <TableCell>{chapter.state || "-"}</TableCell>
                                    <TableCell>{(chapter as any)._count?.users || 0}</TableCell>
                                    <TableCell className="text-right">
                                        <ChapterActions chapter={chapter} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
