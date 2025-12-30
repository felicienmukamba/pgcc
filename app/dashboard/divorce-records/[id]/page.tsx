"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
    ArrowLeft,
    Calendar,
    User,
    Shield,
    Loader2,
    FileText,
    MapPin,
    Scale,
    UserMinus,
    Users
} from "lucide-react"

interface DivorceRecord {
    id: string
    registrationNumber: string
    divorceDate: string
    divorcePlace: string
    reason: string
    judgementNumber: string
    partner1: {
        firstName: string
        lastName: string
        nationalityID: string
        gender: string
    }
    partner2: {
        firstName: string
        lastName: string
        nationalityID: string
        gender: string
    }
    officiant: {
        username: string
    }
    witness1: {
        firstName: string
        lastName: string
    }
    witness2: {
        firstName: string
        lastName: string
    }
}

export default function DivorceRecordDetailsPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const { status } = useSession();
    const [record, setRecord] = useState<DivorceRecord | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchRecord = useCallback(async () => {
        if (!id) return;
        try {
            const response = await fetch(`/api/divorce-records/${id}`);
            if (response.status === 404) {
                setRecord(null);
                return;
            }
            if (!response.ok) throw new Error("Erreur");
            const data = await response.json();
            setRecord(data);
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger l'acte de divorce",
                variant: "destructive"
            })
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (status !== "loading") fetchRecord();
    }, [status, fetchRecord]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                    <p className="text-sm text-muted-foreground animate-pulse">Chargement de l'acte...</p>
                </div>
            </div>
        )
    }

    if (!record) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                    <FileText className="h-6 w-6 text-slate-500" />
                </div>
                <div className="text-center">
                    <h2 className="text-lg font-semibold">Acte introuvable</h2>
                    <p className="text-sm text-muted-foreground">L'acte de divorce #{id} est inaccessible.</p>
                </div>
                <Link href="/dashboard/divorce-records">
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-6">
                        <div className="rounded-xl bg-white/10 p-4 backdrop-blur-md shadow-inner border border-white/20">
                            <Scale className="h-12 w-12 text-white" />
                        </div>
                        <div className="space-y-1 text-white">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">Jugement de Divorce</h1>
                                <Badge className="bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-md border border-white/10">
                                    Dissolution
                                </Badge>
                            </div>
                            <div className="flex flex-col gap-1 text-white/90">
                                <span className="font-semibold text-lg flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> N° {record.registrationNumber}
                                </span>
                                <div className="flex items-center gap-2 text-sm opacity-80">
                                    <Calendar className="h-4 w-4" />
                                    Prononcé le {new Date(record.divorceDate).toLocaleDateString("fr-FR")}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/dashboard/divorce-records">
                            <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-md">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Expouses Details */}
                <Card className="md:col-span-2 border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserMinus className="h-5 w-5 text-red-500" />
                            Parties Concernées
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Partner 1 */}
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-border/50">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                {record.partner1.firstName[0]}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Ex-Conjoint(e) 1</p>
                                <p className="font-bold text-lg">{record.partner1.firstName} {record.partner1.lastName}</p>
                                <Badge variant="outline" className="mt-1">
                                    {record.partner1.gender}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                    <Shield className="h-3 w-3" /> {record.partner1.nationalityID}
                                </div>
                            </div>
                        </div>

                        {/* Partner 2 */}
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-border/50">
                            <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xl">
                                {record.partner2.firstName[0]}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Ex-Conjoint(e) 2</p>
                                <p className="font-bold text-lg">{record.partner2.firstName} {record.partner2.lastName}</p>
                                <Badge variant="outline" className="mt-1">
                                    {record.partner2.gender}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                    <Shield className="h-3 w-3" /> {record.partner2.nationalityID}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details & Location */}
                <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-indigo-500" />
                            Lieu et Jugement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="text-muted-foreground">Lieu du Divorce</span>
                            <span className="font-medium">{record.divorcePlace}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="text-muted-foreground">N° Jugement</span>
                            <span className="font-medium">{record.judgementNumber || "N/A"}</span>
                        </div>
                        <div className="space-y-2 pt-2">
                            <span className="text-sm font-medium text-muted-foreground">Motif (Extrait)</span>
                            <p className="text-sm italic bg-slate-100 dark:bg-slate-900 p-3 rounded-md">
                                {record.reason || "Aucun motif spécifié."}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Witnesses & Official */}
                <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-emerald-500" />
                            Témoins et Officier
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">Témoin 1</p>
                                <p className="font-medium">{record.witness1.firstName} {record.witness1.lastName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">Témoin 2</p>
                                <p className="font-medium">{record.witness2.firstName} {record.witness2.lastName}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                                    <User className="h-4 w-4 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{record.officiant.username}</p>
                                    <p className="text-xs text-muted-foreground">Officier d'État Civil</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
