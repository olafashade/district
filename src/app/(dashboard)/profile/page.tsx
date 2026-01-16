"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { Loader2, KeyRound, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { updateProfile, requestPasswordChangeOtp, changePasswordWithOtp } from "@/lib/actions/profile"

const profileSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const passwordSchema = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    otp: z.string().length(6, "OTP must be 6 digits"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession()
    const [isLoading, setIsLoading] = React.useState(false)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false)
    const [otpSent, setOtpSent] = React.useState(false)
    const [countdown, setCountdown] = React.useState(0)

    const RESEND_DELAY = 90;

    // Profile Form
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
        },
    })

    // Password Form
    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
            otp: "",
        },
    })

    // Load initial data
    React.useEffect(() => {
        if (session?.user) {
            const user = session.user as any;
            if (user.firstName && user.lastName) {
                profileForm.reset({
                    firstName: user.firstName,
                    lastName: user.lastName,
                })
            } else if (user.name) {
                const parts = user.name.split(" ")
                profileForm.reset({
                    firstName: parts[0] || "",
                    lastName: parts.slice(1).join(" ") || "",
                })
            }
        }
    }, [session, profileForm])

    // Handle Profile Update
    async function onProfileSubmit(data: ProfileFormValues) {
        setIsLoading(true)
        try {
            const res = await updateProfile(data)
            if (res.success) {
                toast.success(res.message)
                await updateSession()
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error("Failed to update profile")
        } finally {
            setIsLoading(false)
        }
    }

    // Handle Request OTP
    async function handleRequestOtp() {
        if (countdown > 0) return;

        try {
            setIsLoading(true)
            const res = await requestPasswordChangeOtp()
            if (res.success) {
                toast.success(res.message)
                setOtpSent(true)
                setCountdown(RESEND_DELAY) // Start countdown
                // Open modal if not open
                setIsPasswordModalOpen(true)
            } else {
                toast.error(res.message)
            }
        } catch (e) {
            toast.error("Failed to send OTP")
        } finally {
            setIsLoading(false)
        }
    }

    // Handle Password Change Submit
    async function onPasswordSubmit(data: PasswordFormValues) {
        setIsLoading(true)
        try {
            const res = await changePasswordWithOtp(data)
            if (res.success) {
                toast.success(res.message)
                setIsPasswordModalOpen(false)
                passwordForm.reset()
                setOtpSent(false)
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error("Failed to change password")
        } finally {
            setIsLoading(false)
        }
    }

    // Countdown Timer
    React.useEffect(() => {
        let timer: NodeJS.Timeout
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1)
            }, 1000)
        }
        return () => clearInterval(timer)
    }, [countdown])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    return (
        <div className="container max-w-4xl py-10 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" /> Personal Information
                        </CardTitle>
                        <CardDescription>
                            Update your personal details here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    {...profileForm.register("firstName")}
                                    disabled={isLoading}
                                />
                                {profileForm.formState.errors.firstName && (
                                    <p className="text-sm text-red-500">{profileForm.formState.errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    {...profileForm.register("lastName")}
                                    disabled={isLoading}
                                />
                                {profileForm.formState.errors.lastName && (
                                    <p className="text-sm text-red-500">{profileForm.formState.errors.lastName.message}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input value={session?.user?.email || ''} disabled readOnly className="bg-muted" />
                            </div>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5" /> Security
                        </CardTitle>
                        <CardDescription>
                            Manage your password and security settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <p className="text-sm text-muted-foreground">
                                To change your password, we will verify your identity via a code sent to your email.
                            </p>
                        </div>

                        <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={handleRequestOtp} variant="outline" className="w-full">
                                    Change Password
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-sm">
                                <DialogHeader>
                                    <DialogTitle>Change Password</DialogTitle>
                                    <DialogDescription>
                                        Enter the 6-digit code sent to <b>{session?.user?.email}</b> and your new password.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="otp">OTP Code</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="otp"
                                                placeholder="123456"
                                                maxLength={6}
                                                {...passwordForm.register("otp")}
                                                disabled={isLoading}
                                                className="tracking-widest"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={countdown > 0}
                                                onClick={handleRequestOtp}
                                                className="min-w-[100px]"
                                            >
                                                {countdown > 0 ? formatTime(countdown) : "Resend"}
                                            </Button>
                                        </div>
                                        {passwordForm.formState.errors.otp && (
                                            <p className="text-sm text-red-500">{passwordForm.formState.errors.otp.message}</p>
                                        )}
                                        {countdown > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                You can request a new code in {formatTime(countdown)}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            disabled={isLoading}
                                            {...passwordForm.register("newPassword")}
                                        />
                                        {passwordForm.formState.errors.newPassword && (
                                            <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            disabled={isLoading}
                                            {...passwordForm.register("confirmPassword")}
                                        />
                                        {passwordForm.formState.errors.confirmPassword && (
                                            <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                                        )}
                                    </div>

                                    <DialogFooter>
                                        <Button type="submit" disabled={isLoading} className="w-full">
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Update Password
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
