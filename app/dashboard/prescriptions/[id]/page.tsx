"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
    ArrowLeft,
    Calendar,
    User,
    Loader2,
    Pill,
    Clock,
    FileText,
    Activity,
    UserCheck
} from "lucide-react"

interface Prescription {
    id: string
    date: string
    dosage: string
    duration: string
    quantity: string
    status: string
    instructions?: string
    consultation: {
        id: string
        patient: {
            firstName: string
            lastName: string
            nationalityID: string
        }
        doctor: {
            username: string
        }
    }
    medications: {
        id: string
        tradeName: string
        genericName?: string
        dosage?: string
        unit?: string
        manufacturer?: string
    }[]
}

export default function PrescriptionDetailsPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const { status } = useSession();
    const [prescription, setPrescription] = useState<Prescription | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPrescription = useCallback(async () => {
        if (!id) return;
        try {
            const response = await fetch(`/api/prescriptions/${id}`);
            if (response.status === 404) {
                setPrescription(null);
                return;
            }
            if (!response.ok) throw new Error("Erreur");
            const data = await response.json();
            setPrescription(data);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger la prescription",
                variant: "destructive"
            })
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (status !== "loading") fetchPrescription();
    }, [status, fetchPrescription]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-muted-foreground animate-pulse">Chargement de la prescription...</p>
                </div>
            </div>
        )
    }

    if (!prescription) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                    <Pill className="h-6 w-6 text-slate-500" />
                </div>
                <div className="text-center">
                    <h2 className="text-lg font-semibold">Prescription introuvable</h2>
                    <p className="text-sm text-muted-foreground">La prescription #{id} est introuvable.</p>
                </div>
                <Link href="/dashboard/prescriptions">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                    </Button>
                </Link>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active": return "bg-green-500/80 text-white hover:bg-green-600"
            case "completed": return "bg-blue-500/80 text-white hover:bg-blue-600"
            case "cancelled": return "bg-red-500/80 text-white hover:bg-red-600"
            default: return "bg-slate-500/80 text-white hover:bg-slate-600"
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-6">
                        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-md shadow-inner border border-white/20">
                            <Pill className="h-12 w-12 text-white" />
                        </div>
                        <div className="space-y-1 text-white">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">Prescription Médicale</h1>
                                <Badge className={`${getStatusColor(prescription.status)} backdrop-blur-md border border-white/10`}>
                                    {prescription.status}
                                </Badge>
                            </div>
                            <div className="flex flex-col gap-1 text-white/90">
                                <span className="font-semibold text-lg flex items-center gap-2">
                                    Patient: {prescription.consultation.patient.firstName} {prescription.consultation.patient.lastName}
                                </span>
                                <div className="flex items-center gap-2 text-sm opacity-80">
                                    <Calendar className="h-4 w-4" />
                                    Prescrit le {new Date(prescription.date).toLocaleDateString("fr-FR")}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/dashboard/prescriptions">
                            <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-md">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Posology & Instructions */}
                <Card className="md:col-span-2 border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-500" />
                            Posologie & Instructions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-border/50">
                            <h4 className="text-sm font-medium text-muted-foreground uppercase mb-2">Instructions de Dosage</h4>
                            <p className="text-lg font-medium">{prescription.dosage}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm font-medium text-muted-foreground block mb-1">Durée du traitement</span>
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                                    <Clock className="h-4 w-4" /> {prescription.duration}
                                </div>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground block mb-1">Quantité Totale</span>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                                    <Pill className="h-4 w-4" /> {prescription.quantity}
                                </div>
                            </div>
                        </div>
                        {prescription.instructions && (
                            <div>
                                <span className="text-sm font-medium text-muted-foreground block mb-1">Notes Complémentaires</span>
                                <p className="text-sm bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/50">
                                    {prescription.instructions}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Doctor Card */}
                <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-emerald-500" />
                            Médecin Prescripteur
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">Dr. {prescription.consultation.doctor.username}</p>
                                <p className="text-xs text-muted-foreground bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full w-fit mt-1">
                                    Médecin Agréé
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Medications List */}
                <Card className="md:col-span-3 border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Pill className="h-5 w-5 text-blue-500" />
                            Médicaments Prescrits
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {prescription.medications.map((med) => (
                                <div key={med.id} className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline">{med.genericName || "Générique"}</Badge>
                                        <span className="text-xs text-muted-foreground">{med.manufacturer}</span>
                                    </div>
                                    <h4 className="font-bold text-lg text-primary">{med.tradeName}</h4>
                                    <div className="mt-2 text-sm text-muted-foreground">
                                        {med.dosage && <span>{med.dosage} {med.unit}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
