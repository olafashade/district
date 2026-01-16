"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { userRegisterSchema } from "@/lib/validations/auth"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { registerUser } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }

type FormData = z.infer<typeof userRegisterSchema>

export function UserRegisterForm({ className, ...props }: UserAuthFormProps) {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(userRegisterSchema),
    })
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [showPassword, setShowPassword] = React.useState<boolean>(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false)

    async function onSubmit(data: FormData) {
        setIsLoading(true)

        const result = await registerUser(data)

        setIsLoading(false)

        if (!result.success) {
            return toast.error(result.message)
        }

        toast.success(result.message)
        // Don't redirect immediately to login, let them verify email.
        // router.push("/login") 
        // Maybe show a success message or state telling them to check email.
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-1">
                            <Label className="sr-only" htmlFor="firstName">
                                First Name
                            </Label>
                            <Input
                                id="firstName"
                                placeholder="First Name"
                                type="text"
                                disabled={isLoading}
                                {...register("firstName")}
                            />
                            {errors?.firstName && (
                                <p className="px-1 text-xs text-red-600">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-1">
                            <Label className="sr-only" htmlFor="lastName">
                                Last Name
                            </Label>
                            <Input
                                id="lastName"
                                placeholder="Last Name"
                                type="text"
                                disabled={isLoading}
                                {...register("lastName")}
                            />
                            {errors?.lastName && (
                                <p className="px-1 text-xs text-red-600">
                                    {errors.lastName.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="middleName">
                            Middle Name (Optional)
                        </Label>
                        <Input
                            id="middleName"
                            placeholder="Middle Name (Optional)"
                            type="text"
                            disabled={isLoading}
                            {...register("middleName")}
                        />
                        {errors?.middleName && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.middleName.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            Email
                        </Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            {...register("email")}
                        />
                        {errors?.email && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="password">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                placeholder="Password"
                                type={showPassword ? "text" : "password"}
                                autoCapitalize="none"
                                autoComplete="new-password"
                                disabled={isLoading}
                                className="pr-10"
                                {...register("password")}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                    <Eye className="h-4 w-4" aria-hidden="true" />
                                )}
                                <span className="sr-only">
                                    {showPassword ? "Hide password" : "Show password"}
                                </span>
                            </Button>
                        </div>
                        {errors?.password && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.password.message}
                            </p>
                        )}
                        <p className="text-[0.8rem] text-muted-foreground">
                            Password must be at least 10 characters long and contain at least one number, one uppercase letter, and one special character.
                        </p>
                    </div>
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="confirmPassword">
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                placeholder="Confirm Password"
                                type={showConfirmPassword ? "text" : "password"}
                                autoCapitalize="none"
                                autoComplete="new-password"
                                disabled={isLoading}
                                className="pr-10"
                                {...register("confirmPassword")}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                    <Eye className="h-4 w-4" aria-hidden="true" />
                                )}
                                <span className="sr-only">
                                    {showConfirmPassword ? "Hide password" : "Show password"}
                                </span>
                            </Button>
                        </div>
                        {errors?.confirmPassword && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>
                    <button className={cn(buttonVariants())} disabled={isLoading}>
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Sign Up
                    </button>
                </div>
            </form>
        </div>
    )
}
