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
import { Payment } from "@prisma/client"
import { format } from "date-fns"

interface ReportPaymentTableProps {
    payments: (Payment & {
        user: { firstName: string | null; lastName: string | null; email: string; district: { name: string } | null; chapter: { name: string } | null };
        fee: { name: string; chapter: { name: string } } | null;
    })[]
    districts: { id: string; name: string }[]
    chapters: { id: string; name: string }[]
    currentUser: any
}

export function ReportPaymentTable({ payments, districts, chapters, currentUser }: ReportPaymentTableProps) {
    const isDistrictRestricted = !currentUser?.isSuperAdmin && !!currentUser?.districtId
    const isChapterRestricted = !currentUser?.isSuperAdmin && !!currentUser?.chapterId

    const initialDistrict = isDistrictRestricted ? currentUser.districtId : "all"
    const initialChapter = isChapterRestricted ? currentUser.chapterId : "all"

    // Input states
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

    const filteredPayments = payments.filter(payment => {
        const user = payment.user;
        const matchesName = !appliedFilterName ||
            (user.firstName?.toLowerCase().includes(appliedFilterName.toLowerCase()) ||
                user.lastName?.toLowerCase().includes(appliedFilterName.toLowerCase()) ||
                user.email?.toLowerCase().includes(appliedFilterName.toLowerCase()));

        const matchesDistrict = appliedFilterDistrict === "all" || (user.district?.name && user.district?.name.includes(districts.find(d => d.id === appliedFilterDistrict)?.name || "impossible_match"));

        const u = user as any;
        const matchesDistrictID = appliedFilterDistrict === "all" || u.districtId === appliedFilterDistrict;
        const matchesChapterID = appliedFilterChapter === "all" || u.chapterId === appliedFilterChapter;

        return matchesName && matchesDistrictID && matchesChapterID;
    })

    return (
        <div className="space-y-4">
            <div className="space-y-4"> <h2 className="text-xl font-semibold">Payment History</h2></div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">

                <div className="flex flex-1 items-center justify-end space-x-2">
                    <Input
                        placeholder="Search user..."
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
                            <TableHead>Date</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Fee</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Chapter</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    No payments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPayments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{format(new Date(payment.date), "PPP")}</TableCell>
                                    <TableCell>{payment.user.firstName} {payment.user.lastName}</TableCell>
                                    <TableCell>{payment.fee?.name}</TableCell>
                                    <TableCell>{payment.amount.toLocaleString()}</TableCell>
                                    <TableCell>{(payment as any).paymentYear || "-"}</TableCell>
                                    <TableCell>{payment.user.district?.name || "-"}</TableCell>
                                    <TableCell>{payment.user.chapter?.name || "-"}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-sm text-muted-foreground">
                Showing {filteredPayments.length} records
            </div>
        </div>
    )
}
