"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { User } from "@prisma/client"

interface ReportMemberTableProps {
    members: (User & { district: { name: string } | null; chapter: { name: string } | null })[]
    districts: { id: string; name: string }[]
    chapters: { id: string; name: string }[]
    title: string
    currentUser: any
}

export function ReportMemberTable({ members, districts, chapters, title, currentUser }: ReportMemberTableProps) {

    const isDistrictRestricted = !currentUser?.isSuperAdmin && !!currentUser?.districtId
    const isChapterRestricted = !currentUser?.isSuperAdmin && !!currentUser?.chapterId

    const initialDistrict = isDistrictRestricted ? currentUser.districtId : "all"
    const initialChapter = isChapterRestricted ? currentUser.chapterId : "all"

    const [filterName, setFilterName] = React.useState("")
    const [filterDistrict, setFilterDistrict] = React.useState(initialDistrict)
    const [filterChapter, setFilterChapter] = React.useState(initialChapter)

    const [appliedFilterName, setAppliedFilterName] = React.useState("")
    const [appliedFilterDistrict, setAppliedFilterDistrict] = React.useState(initialDistrict)
    const [appliedFilterChapter, setAppliedFilterChapter] = React.useState(initialChapter)

    const handleFilter = () => {
        setAppliedFilterName(filterName)
        setAppliedFilterDistrict(filterDistrict)
        setAppliedFilterChapter(filterChapter)
    }

    const filteredMembers = members.filter(member => {
        const matchesName = !appliedFilterName ||
            (member.firstName?.toLowerCase().includes(appliedFilterName.toLowerCase()) ||
                member.lastName?.toLowerCase().includes(appliedFilterName.toLowerCase()) ||
                member.email?.toLowerCase().includes(appliedFilterName.toLowerCase()));

        const matchesDistrict = appliedFilterDistrict === "all" || member.districtId === appliedFilterDistrict;
        const matchesChapter = appliedFilterChapter === "all" || member.chapterId === appliedFilterChapter;

        return matchesName && matchesDistrict && matchesChapter;
    })

    return (
        <div className="space-y-4">
            <div className="py-4"><h2 className="text-xl font-semibold">{title}</h2></div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">

                <div className="flex flex-1 items-center justify-end space-x-2">
                    <Input
                        placeholder="Search..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                    <Select disabled={isDistrictRestricted} value={filterDistrict} onValueChange={setFilterDistrict}>
                        <SelectTrigger className="h-8 w-[150px] lg:w-[200px]">
                            <SelectValue placeholder="All Districts" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Districts</SelectItem>
                            {districts.map(d => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select disabled={isChapterRestricted} value={filterChapter} onValueChange={setFilterChapter}>
                        <SelectTrigger className="h-8 w-[150px] lg:w-[200px]">
                            <SelectValue placeholder="All Chapters" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Chapters</SelectItem>
                            {chapters.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button size="sm" onClick={handleFilter}>Filter</Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>First Name</TableHead>
                            <TableHead>Last Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Chapter</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMembers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    No members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>{member.firstName}</TableCell>
                                    <TableCell>{member.lastName}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>{member.district?.name || "-"}</TableCell>
                                    <TableCell>{member.chapter?.name || "-"}</TableCell>
                                    <TableCell>{member.financialStatus.replace(/_/g, " ")}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-sm text-muted-foreground">
                Showing {filteredMembers.length} records
            </div>
        </div>
    )
}
