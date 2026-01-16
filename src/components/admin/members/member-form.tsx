"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { memberSchema, MemberFormValues } from "@/lib/validations/member"
import { createMember, updateMember } from "@/lib/actions/member"
import { Chapter, District, User, UserRole, MemberType } from "@prisma/client"
import { states } from "@/lib/constants/states"

interface MemberFormProps {
    initialData?: User | null
    districts: District[]
    chapters: Chapter[]
    currentUser: any
}

export function MemberForm({ initialData, districts, chapters, currentUser }: MemberFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    const isDistrictRestricted = !currentUser?.isSuperAdmin && !!currentUser?.districtId
    const isChapterRestricted = !currentUser?.isSuperAdmin && !!currentUser?.chapterId

    const [selectedDistrict, setSelectedDistrict] = React.useState<string>(
        initialData?.districtId || (isDistrictRestricted ? currentUser.districtId : "")
    )

    // Filter chapters based on selected district
    const filteredChapters = selectedDistrict
        ? chapters.filter(c => c.districtId === selectedDistrict)
        : chapters

    const form = useForm<MemberFormValues>({
        resolver: zodResolver(memberSchema) as any,
        defaultValues: initialData ? {
            email: initialData.email,
            firstName: initialData.firstName || "",
            lastName: initialData.lastName || "",
            middleName: initialData.middleName || "",
            phone: initialData.phone || "",
            mailingAddress: initialData.mailingAddress || "",
            mailingAddress2: initialData.mailingAddress2 || "",
            city: initialData.city || "",
            state: initialData.state || "",
            zipcode: initialData.zipcode || "",
            districtId: initialData.districtId || "",
            chapterId: initialData.chapterId || "",
            initiationChapterId: initialData.initiationChapterId || "",
            controlNumber: initialData.controlNumber || "",
            initiationYear: initialData.initiationYear || 1980,
            role: initialData.role || "USER",
            memberType: initialData.memberType || "NON_STUDENT",
        } : {
            email: "",
            firstName: "",
            lastName: "",
            middleName: "",
            phone: "",
            mailingAddress: "",
            mailingAddress2: "",
            city: "",
            state: "",
            zipcode: "",
            districtId: isDistrictRestricted ? currentUser.districtId : "",
            chapterId: isChapterRestricted ? currentUser.chapterId : "",
            initiationChapterId: "",
            controlNumber: "",
            initiationYear: 2024,
            role: "USER",
            memberType: "NON_STUDENT",
        },
    })

    async function onSubmit(data: MemberFormValues) {
        setIsLoading(true)

        try {
            if (initialData) {
                const res = await updateMember(initialData.id, data)
                if (res.success) {
                    toast.success(res.message)
                    router.push("/admin/members")
                    router.refresh()
                } else {
                    toast.error(res.message)
                }
            } else {
                const res = await createMember(data)
                if (res.success) {
                    toast.success(res.message)
                    router.push("/admin/members")
                    router.refresh()
                } else {
                    toast.error(res.message)
                }
            }

        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    const years = Array.from({ length: new Date().getFullYear() - 1979 }, (_, i) => 1980 + i).reverse();

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">

                {/* Personal Info */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" placeholder="Enter first name" disabled={isLoading} {...form.register("firstName")} />
                                {form.formState.errors.firstName && (<p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>)}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" placeholder="Enter last name" disabled={isLoading} {...form.register("lastName")} />
                                {form.formState.errors.lastName && (<p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>)}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="middleName">Middle Name (Optional)</Label>
                                <Input id="middleName" placeholder="Enter middle name" disabled={isLoading} {...form.register("middleName")} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="Enter email address" disabled={isLoading} {...form.register("email")} />
                                {form.formState.errors.email && (<p className="text-sm text-red-500">{form.formState.errors.email.message}</p>)}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone (Optional)</Label>
                                <Input id="phone" placeholder="Enter phone number" disabled={isLoading} {...form.register("phone")} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Address</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="mailingAddress">Mailing Address (Optional)</Label>
                                <Input id="mailingAddress" placeholder="Enter street address" disabled={isLoading} {...form.register("mailingAddress")} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="mailingAddress2">Mailing Address 2 (Optional)</Label>
                                <Input id="mailingAddress2" placeholder="Apartment, suite, unit, etc." disabled={isLoading} {...form.register("mailingAddress2")} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="city">City (Optional)</Label>
                                <Input id="city" placeholder="Enter city" disabled={isLoading} {...form.register("city")} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="zipcode">Zip Code (Optional)</Label>
                                <Input id="zipcode" placeholder="Enter zip code" disabled={isLoading} {...form.register("zipcode")} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="state">State (Optional)</Label>
                                <Select
                                    disabled={isLoading}
                                    onValueChange={(value) => form.setValue("state", value)}
                                    defaultValue={form.watch("state")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {states.map((state) => (
                                            <SelectItem key={state.value} value={state.value}>
                                                {state.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Membership Details */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Membership Details</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="controlNumber">Control Number</Label>
                                <Input id="controlNumber" placeholder="Enter control number" disabled={isLoading} {...form.register("controlNumber")} />
                                {form.formState.errors.controlNumber && (<p className="text-sm text-red-500">{form.formState.errors.controlNumber.message}</p>)}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="memberType">Member Type</Label>
                                <Select
                                    disabled={isLoading}
                                    onValueChange={(value) => form.setValue("memberType", value as MemberType)}
                                    defaultValue={form.watch("memberType")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STUDENT">Student</SelectItem>
                                        <SelectItem value="NON_STUDENT">Non-Student</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="districtId">District</Label>
                                <Select
                                    disabled={isLoading || isDistrictRestricted}
                                    onValueChange={(value) => {
                                        form.setValue("districtId", value)
                                        setSelectedDistrict(value)
                                        form.setValue("chapterId", "")
                                    }}
                                    defaultValue={form.watch("districtId")}
                                    value={form.watch("districtId")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a district" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {districts.map((district) => (
                                            <SelectItem key={district.id} value={district.id}>
                                                {district.name} ({district.number})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.districtId && (<p className="text-sm text-red-500">{form.formState.errors.districtId.message}</p>)}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="chapterId">Chapter</Label>
                                <Select
                                    disabled={isLoading || isChapterRestricted || !selectedDistrict}
                                    onValueChange={(value) => form.setValue("chapterId", value)}
                                    defaultValue={form.watch("chapterId")}
                                    value={form.watch("chapterId")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a chapter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredChapters.length > 0 ? (
                                            filteredChapters.map((chapter) => (
                                                <SelectItem key={chapter.id} value={chapter.id}>
                                                    {chapter.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-sm text-muted-foreground text-center">No chapters found in this district</div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.chapterId && (<p className="text-sm text-red-500">{form.formState.errors.chapterId.message}</p>)}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="initiationYear">Initiation Year (Optional)</Label>
                                <Select
                                    disabled={isLoading}
                                    onValueChange={(value) => form.setValue("initiationYear", parseInt(value))}
                                    defaultValue={form.watch("initiationYear")?.toString()}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="initiationChapterId">Initiation Chapter (Optional)</Label>
                                <Select
                                    disabled={isLoading}
                                    onValueChange={(value) => form.setValue("initiationChapterId", value)}
                                    defaultValue={form.watch("initiationChapterId")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a chapter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {chapters.map((chapter) => (
                                            <SelectItem key={chapter.id} value={chapter.id}>
                                                {chapter.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    disabled={isLoading}
                                    onValueChange={(value) => form.setValue("role", value as UserRole)}
                                    defaultValue={form.watch("role")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USER">User (Standard Member)</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Button disabled={isLoading} type="submit">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Save changes" : "Create Member"}
            </Button>
        </form>
    )
}
