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
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { PaymentModal } from "./payment-modal"
import { User, Fee } from "@prisma/client"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserListProps {
    users: (User & { district: { name: string } | null; chapter: { name: string } | null })[]
    fees: (Fee & { chapter: { name: string } })[]
    districts: { id: string; name: string }[]
    chapters: { id: string; name: string }[]
    currentUser: any
}

export function UserList({ users, fees, districts, chapters, currentUser }: UserListProps) {
    const [selectedUsers, setSelectedUsers] = React.useState<string[]>([])

    const isDistrictRestricted = !currentUser?.isSuperAdmin && !!currentUser?.districtId
    const isChapterRestricted = !currentUser?.isSuperAdmin && !!currentUser?.chapterId

    const initialDistrict = isDistrictRestricted ? currentUser.districtId : "all"
    const initialChapter = isChapterRestricted ? currentUser.chapterId : "all"

    // Input states
    const [filterName, setFilterName] = React.useState("")
    const [filterDistrict, setFilterDistrict] = React.useState(initialDistrict)
    const [filterChapter, setFilterChapter] = React.useState(initialChapter)

    // Applied states for filtering
    const [appliedFilterName, setAppliedFilterName] = React.useState("")
    const [appliedFilterDistrict, setAppliedFilterDistrict] = React.useState(initialDistrict)
    const [appliedFilterChapter, setAppliedFilterChapter] = React.useState(initialChapter)

    const handleFilter = () => {
        setAppliedFilterName(filterName)
        setAppliedFilterDistrict(filterDistrict)
        setAppliedFilterChapter(filterChapter)
        setSelectedUsers([])
    }

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesName = !appliedFilterName ||
            (user.firstName?.toLowerCase().includes(appliedFilterName.toLowerCase()) ||
                user.lastName?.toLowerCase().includes(appliedFilterName.toLowerCase()) ||
                user.email?.toLowerCase().includes(appliedFilterName.toLowerCase()));

        const matchesDistrict = appliedFilterDistrict === "all" || user.districtId === appliedFilterDistrict;
        const matchesChapter = appliedFilterChapter === "all" || user.chapterId === appliedFilterChapter;

        return matchesName && matchesDistrict && matchesChapter;
    })

    // Bulk selection logic
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUsers(filteredUsers.map(u => u.id))
        } else {
            setSelectedUsers([])
        }
    }

    const handleSelectUser = (userId: string, checked: boolean) => {
        if (checked) {
            setSelectedUsers(prev => [...prev, userId])
        } else {
            setSelectedUsers(prev => prev.filter(id => id !== userId))
        }
    }

    const selectedUserObjects = users.filter(u => selectedUsers.includes(u.id))

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
                <div className="flex flex-1 items-center space-x-2">
                    <Input
                        placeholder="Search by name or email..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                        className="h-8 w-[200px] lg:w-[300px]"
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

                    <Button onClick={handleFilter}>Filter</Button>
                </div>

                {selectedUsers.length > 0 && (
                    <PaymentModal
                        users={selectedUserObjects}
                        fees={fees}
                        trigger={<Button>Make Payment ({selectedUsers.length})</Button>}
                        onSuccess={() => setSelectedUsers([])}
                    />
                )}
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Chapter</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedUsers.includes(user.id)}
                                            onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                                        />
                                    </TableCell>
                                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.district?.name || "-"}</TableCell>
                                    <TableCell>{user.chapter?.name || "-"}</TableCell>
                                    <TableCell className="text-right">
                                        <PaymentModal
                                            users={[user]}
                                            fees={fees}
                                            trigger={<Button size="sm" variant="secondary">Make Payment</Button>}
                                        />
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
