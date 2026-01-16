"use client"

import * as React from "react"

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    description?: string
}

export function StatCard({ title, value, icon, description }: StatCardProps) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">
                    {title}
                </h3>
                {icon}
            </div>
            <div className="p-6 pt-0">
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
        </div>
    )
}
