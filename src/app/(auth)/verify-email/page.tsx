"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { verifyEmail } from "@/lib/actions/verify"
import { Loader2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

function VerifyEmailInner() {
    const searchParams = useSearchParams()
    const token = searchParams?.get("token")
    const router = useRouter()
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (!token) {
            setStatus("error")
            setMessage("Invalid token")
            return
        }

        verifyEmail(token)
            .then((result) => {
                if (result.success) {
                    setStatus("success")
                    setMessage(result.message)
                } else {
                    setStatus("error")
                    setMessage(result.message)
                }
            })
            .catch((err) => {
                setStatus("error")
                setMessage("An error occurred during verification.")
            })
    }, [token])

    return (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
            {status === "loading" && (
                <>
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>Verifying your email...</p>
                </>
            )}
            {status === "success" && (
                <div className="space-y-4">
                    <h1 className="text-2xl font-semibold text-green-600">Success!</h1>
                    <p>{message}</p>
                    <Link href="/login" className={cn(buttonVariants({ variant: "default" }))}>
                        Go to Login
                    </Link>
                </div>
            )}
            {status === "error" && (
                <div className="space-y-4">
                    <h1 className="text-2xl font-semibold text-red-600">Verification Failed</h1>
                    <p>{message}</p>
                    <Link href="/login" className={cn(buttonVariants({ variant: "outline" }))}>
                        Back to Login
                    </Link>
                </div>
            )}
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                <VerifyEmailInner />
            </Suspense>
        </div>
    )
}
