"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Chapter, District } from "@prisma/client"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface MemberFiltersProps {
    districts: District[]
    chapters: Chapter[]
    currentUser: any
}

export function MemberFilters({ districts, chapters, currentUser }: MemberFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const isDistrictRestricted = !currentUser?.isSuperAdmin && !!currentUser?.districtId
    const isChapterRestricted = !currentUser?.isSuperAdmin && !!currentUser?.chapterId

    // Initial state from URL
    const initialSearch = searchParams.get("search") || ""
    const initialDistrictId = searchParams.get("districtId") || (isDistrictRestricted ? currentUser.districtId : "")
    const initialChapterId = searchParams.get("chapterId") || (isChapterRestricted ? currentUser.chapterId : "")

    // Local state
    const [searchValue, setSearchValue] = React.useState(initialSearch)
    const [selectedDistrictId, setSelectedDistrictId] = React.useState(initialDistrictId)
    const [selectedChapterId, setSelectedChapterId] = React.useState(initialChapterId)

    // Sync local state if URL changes externally (optional but good practice)
    React.useEffect(() => {
        setSearchValue(searchParams.get("search") || "")
        setSelectedDistrictId(searchParams.get("districtId") || (isDistrictRestricted ? currentUser.districtId : ""))
        setSelectedChapterId(searchParams.get("chapterId") || (isChapterRestricted ? currentUser.chapterId : ""))
    }, [searchParams, isDistrictRestricted, isChapterRestricted, currentUser])


    const applyFilters = () => {
        const params = new URLSearchParams()

        if (searchValue) params.set("search", searchValue)
        if (selectedDistrictId && selectedDistrictId !== "all") params.set("districtId", selectedDistrictId)
        if (selectedChapterId && selectedChapterId !== "all") params.set("chapterId", selectedChapterId)

        params.set("page", "1") // Always reset to page 1

        router.push(`?${params.toString()}`)
    }

    const resetFilters = () => {
        setSearchValue("")
        const defaultDistrictId = isDistrictRestricted ? currentUser.districtId : ""
        const defaultChapterId = isChapterRestricted ? currentUser.chapterId : ""

        setSelectedDistrictId(defaultDistrictId)
        setSelectedChapterId(defaultChapterId)

        const params = new URLSearchParams()
        if (defaultDistrictId) params.set("districtId", defaultDistrictId)
        if (defaultChapterId) params.set("chapterId", defaultChapterId)

        router.push(`?${params.toString()}`)
    }

    // Filter chapters based on selected district
    const filteredChapters = selectedDistrictId && selectedDistrictId !== "all"
        ? chapters.filter((c) => c.districtId === selectedDistrictId)
        : chapters

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Search by name, email, or control #..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="h-8 w-[200px] lg:w-[300px]"
                />

                <Select
                    value={selectedDistrictId}
                    disabled={isDistrictRestricted}
                    onValueChange={(value) => {
                        setSelectedDistrictId(value)
                        if (value !== selectedDistrictId) setSelectedChapterId("all") // Reset chapter if district changes
                    }}
                >
                    <SelectTrigger className="h-8 w-[150px] lg:w-[200px]">
                        <SelectValue placeholder="All Districts" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        {districts.map((district) => (
                            <SelectItem key={district.id} value={district.id}>
                                {district.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={selectedChapterId}
                    disabled={isChapterRestricted}
                    onValueChange={setSelectedChapterId}
                >
                    <SelectTrigger className="h-8 w-[150px] lg:w-[200px]">
                        <SelectValue placeholder="All Chapters" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Chapters</SelectItem>
                        {filteredChapters.map((chapter) => (
                            <SelectItem key={chapter.id} value={chapter.id}>
                                {chapter.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    onClick={applyFilters}
                    size="sm"
                    className="h-8"
                >
                    Search
                </Button>

                {(searchValue || selectedDistrictId || selectedChapterId) && (
                    <Button
                        variant="ghost"
                        onClick={resetFilters}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
