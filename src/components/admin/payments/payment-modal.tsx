"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Fee } from "@prisma/client"
import { createBulkPayments } from "@/lib/actions/payment"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface PaymentModalProps {
    users: { id: string; firstName: string | null; lastName: string | null }[]
    fees: (Fee & { chapter: { name: string } })[]
    onSuccess?: () => void
    trigger?: React.ReactNode
}

export function PaymentModal({ users, fees, onSuccess, trigger }: PaymentModalProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedFeeId, setSelectedFeeId] = React.useState<string>("")
    const [paymentYear, setPaymentYear] = React.useState<string>(new Date().getFullYear().toString())
    const [isLoading, setIsLoading] = React.useState(false)

    const selectedFee = fees.find(f => f.id === selectedFeeId)
    const isMembership = selectedFee?.membershipFee || selectedFee?.newMembershipFee

    async function handlePayment() {
        if (!selectedFeeId) {
            toast.error("Please select a fee")
            return
        }
        if (users.length === 0) {
            toast.error("No users selected")
            return
        }

        setIsLoading(true)
        try {
            const res = await createBulkPayments({
                userIds: users.map(u => u.id),
                feeId: selectedFeeId,
                amount: selectedFee!.amount,
                paymentYear: isMembership ? parseInt(paymentYear) : undefined
            })

            if (res.success) {
                toast.success(res.message)
                setOpen(false)
                setSelectedFeeId("")
                if (onSuccess) onSuccess()
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error("Failed to process payment")
        } finally {
            setIsLoading(false)
        }
    }

    // Generate years for membership (e.g. current year + next year, or range)
    const years = [new Date().getFullYear(), new Date().getFullYear() + 1]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Make Payment</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Make Payment</DialogTitle>
                    <DialogDescription>
                        Process payment for {users.length} user{users.length > 1 ? 's' : ''}.
                        {users.length === 1 && users[0].firstName && ` (${users[0].firstName} ${users[0].lastName})`}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Select Fee</Label>
                        <Select onValueChange={setSelectedFeeId} value={selectedFeeId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a fee" />
                            </SelectTrigger>
                            <SelectContent>
                                {fees.map((fee) => (
                                    <SelectItem key={fee.id} value={fee.id}>
                                        {fee.name} ({fee.chapter.name})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedFee && (
                        <div className="grid gap-2">
                            <Label>Amount</Label>
                            <Input value={selectedFee.amount} disabled />
                        </div>
                    )}

                    {isMembership && (
                        <div className="grid gap-2">
                            <Label>Payment Year</Label>
                            <Select onValueChange={setPaymentYear} value={paymentYear}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => (
                                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={handlePayment} disabled={isLoading || !selectedFeeId}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
