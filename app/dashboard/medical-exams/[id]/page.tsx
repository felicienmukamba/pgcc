"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
    ArrowLeft,
    Calendar,
    User,
    Loader2,
    Stethoscope,
    Activity,
    FileText,
    Microscope,
    Info
} from "lucide-react"

interface MedicalExam {
    id: string
    examType: string
    date: string
    results: string
    notes: string | null
    patient: {
        firstName: string
        lastName: string
        nationalityID: string
        gender: string
        birthDate: string
    }
    doctor: {
        username: string
    }
}

export default function MedicalExamDetailsPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const { status } = useSession();
    const [exam, setExam] = useState<MedicalExam | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchExam = useCallback(async () => {
        if (!id) return;
        try {
            const response = await fetch(`/api/medical-exams/${id}`);
            if (response.status === 404) {
                setExam(null);
                return;
            }
            if (!response.ok) throw new Error("Erreur");
            const data = await response.json();
            setExam(data);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger l'examen",
                variant: "destructive"
            })
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (status !== "loading") fetchExam();
    }, [status, fetchExam]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                    <p className="text-sm text-muted-foreground animate-pulse">Chargement de l'examen...</p>
                </div>
            </div>
        )
    }

    if (!exam) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                    <Activity className="h-6 w-6 text-slate-500" />
                </div>
                <div className="text-center">
                    <h2 className="text-lg font-semibold">Examen introuvable</h2>
                    <p className="text-sm text-muted-foreground">L'examen #{id} est introuvable.</p>
                </div>
                <Link href="/dashboard/medical-exams">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-900 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-6">
                        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-md shadow-inner border border-white/20">
                            <Microscope className="h-12 w-12 text-white" />
                        </div>
                        <div className="space-y-1 text-white">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">Rapport d'Examen</h1>
                                <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/10">
                                    {exam.examType}
                                </Badge>
                            </div>
                            <div className="flex flex-col gap-1 text-white/90">
                                <span className="font-semibold text-lg flex items-center gap-2">
                                    Patient: {exam.patient.firstName} {exam.patient.lastName}
                                </span>
                                <div className="flex items-center gap-2 text-sm opacity-80">
                                    <Calendar className="h-4 w-4" />
                                    Réalisé le {new Date(exam.date).toLocaleDateString("fr-FR")}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/dashboard/medical-exams">
                            <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-md">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Results Card */}
                <Card className="md:col-span-2 border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm h-full">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-teal-500" />
                            Résultats et Observations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-border/50 shadow-inner">
                            <h4 className="text-sm font-medium text-muted-foreground uppercase mb-4 tracking-wider">Conclusion de l'Examen</h4>
                            <p className="text-lg leading-relaxed whitespace-pre-wrap font-serif text-slate-800 dark:text-slate-200">
                                {exam.results}
                            </p>
                        </div>

                        {exam.notes && (
                            <div className="flex gap-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-100 dark:border-yellow-900/50">
                                <Info className="h-5 w-5 shrink-0" />
                                <div>
                                    <span className="font-bold block text-sm mb-1">Notes Complémentaires</span>
                                    <p className="text-sm">{exam.notes}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {/* Patient Card */}
                    <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-500" />
                                Informations Patient
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl mb-3">
                                    {exam.patient.firstName[0]}
                                </div>
                                <h3 className="font-bold text-lg">{exam.patient.firstName} {exam.patient.lastName}</h3>
                                <p className="text-sm text-muted-foreground">{exam.patient.nationalityID}</p>
                                <div className="mt-3 flex gap-2">
                                    <Badge variant="outline">{exam.patient.gender}</Badge>
                                    <Badge variant="outline">
                                        {new Date().getFullYear() - new Date(exam.patient.birthDate).getFullYear()} ans
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Doctor Card */}
                    <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Stethoscope className="h-5 w-5 text-emerald-500" />
                                Médecin Responsable
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-lg">Dr. {exam.doctor.username}</p>
                                    <p className="text-xs text-muted-foreground">Praticien Hospitalier</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
