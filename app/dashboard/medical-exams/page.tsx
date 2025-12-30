"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Stethoscope } from "lucide-react"
import Link from "next/link"
import { RoleGuard } from "@/components/auth/role-guard"

interface MedicalExam {
    id: string
    examType: string
    date: Date
    results: string
    patient: {
        firstName: string
        lastName: string
        nationalityID: string
    }
    doctor: {
        username: string
    }
}

export default function MedicalExamsPage() {
    const [medicalExams, setMedicalExams] = useState<MedicalExam[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMedicalExams()
    }, [])

    const fetchMedicalExams = async () => {
        try {
            const response = await fetch("/api/medical-exams")
            if (response.ok) {
                const data = await response.json()
                setMedicalExams(data)
            }
        } catch (error) {
            console.error("Error fetching medical exams", error)
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
                    <h1 className="text-3xl font-bold tracking-tight">Examens Médicaux</h1>
                    <p className="text-muted-foreground">Registre numérique des examens et analyses médicales</p>
                </div>
                <RoleGuard permission="exam.write">
                    <Link href="/dashboard/medical-exams/new">
                        <Button className="font-semibold shadow-lg">
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvel Examen
                        </Button>
                    </Link>
                </RoleGuard>
            </div>

            <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-teal-100 dark:bg-teal-900/40 rounded-xl">
                            <Stethoscope className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                            <CardTitle>Dossiers d'Examens</CardTitle>
                            <CardDescription>Liste complète des examens effectués</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={medicalExams} searchKey="patient.lastName" />
                </CardContent>
            </Card>
        </div>
    )
}
