"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { syncChaptersAndDistricts, syncMembers, syncFinancialMembers } from "@/lib/actions/sync"

export function SyncButton() {
    const [isSyncing, setIsSyncing] = React.useState(false)
    const router = useRouter()

    async function handleSync() {
        setIsSyncing(true)
        try {
            toast.info("Starting sync process...")

            // 1. Sync Districts & Chapters
            toast.info("Syncing Districts & Chapters...")
            const entResult = await syncChaptersAndDistricts()
            if (!entResult.success) {
                toast.error(entResult.message)
                setIsSyncing(false)
                return
            }
            toast.success(entResult.message)

            // 2. Sync All Members
            toast.info("Syncing All Members...")
            const memResult = await syncMembers()
            if (!memResult.success) {
                toast.error(memResult.message)
                setIsSyncing(false)
                return
            }
            toast.success(memResult.message)

            // 3. Sync Financial Members
            toast.info("Syncing Financial Members...")
            const finResult = await syncFinancialMembers()
            if (finResult.success) {
                toast.success(finResult.message)
                router.refresh()
            } else {
                toast.error(finResult.message)
            }

        } catch (error) {
            toast.error("An unexpected error occurred during sync.")
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <Button onClick={handleSync} disabled={isSyncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync All Data"}
        </Button>
    )
}
