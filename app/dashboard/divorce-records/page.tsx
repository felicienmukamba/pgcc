"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, UserMinus } from "lucide-react"
import Link from "next/link"
import { RoleGuard } from "@/components/auth/role-guard"

interface DivorceRecord {
    id: string
    registrationNumber: string
    partner1: {
        firstName: string
        lastName: string
    }
    partner2: {
        firstName: string
        lastName: string
    }
    divorceDate: string
    divorcePlace: string
    officiant: {
        username: string
    }
}

export default function DivorceRecordsPage() {
    const [divorceRecords, setDivorceRecords] = useState<DivorceRecord[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDivorceRecords()
    }, [])

    const fetchDivorceRecords = async () => {
        try {
            const response = await fetch("/api/divorce-records")
            if (response.ok) {
                const data = await response.json()
                setDivorceRecords(data)
            }
        } catch (error) {
            console.error("Error fetching divorce records", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div>Chargement...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Actes de Divorce</h1>
                    <p className="text-muted-foreground">Registre central des dissolutions de mariage</p>
                </div>
                <RoleGuard permission="divorce.write">
                    <Link href="/dashboard/divorce-records/new">
                        <Button variant="destructive" className="font-semibold shadow-lg">
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvel Acte de Divorce
                        </Button>
                    </Link>
                </RoleGuard>
            </div>

            <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl">
                            <UserMinus className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <CardTitle>Dossiers de Divorce</CardTitle>
                            <CardDescription>Liste complète des divorces enregistrés</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={divorceRecords} searchKey="registrationNumber" />
                </CardContent>
            </Card>
        </div>
    )
}
