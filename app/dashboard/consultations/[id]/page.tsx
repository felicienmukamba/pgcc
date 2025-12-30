"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Loader2, ArrowLeft, Pencil, FileText, Calendar, Clock, DollarSign, User, Stethoscope, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Interfaces
interface Medication {
  id: string;
  name: string;
}

interface Prescription {
  id: string;
  dosage: string;
  duration: string;
  quantity: number;
  status: string;
  medications: Medication[];
}

interface Consultation {
  id: string;
  date: string;
  diagnosis: string;
  price: number;
  duration: number; // minutes
  notes: string | null;
  doctor: {
    id: string;
    username: string; // Changed from firstName/lastName based on previous API response structure where doctor had username
    firstName?: string; // Optional fallbacks if API changes
    lastName?: string;
  };
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    nationalityID: string;
  };
  prescriptions: Prescription[];
}

export default function ConsultationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const consultationId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: session, status } = useSession();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  const canEdit = session?.user?.roles.includes("MEDECIN");

  const fetchConsultation = useCallback(async () => {
    if (!consultationId) return;

    try {
      const response = await fetch(`/api/consultations/${consultationId}`);
      if (response.status === 404) {
        setConsultation(null);
        return;
      }
      if (!response.ok) throw new Error("Erreur lors de la récupération.");
      const data = await response.json();
      setConsultation(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    if (status !== "loading") fetchConsultation();
  }, [status, fetchConsultation]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-muted-foreground animate-pulse">Chargement du dossier médical...</p>
        </div>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
          <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">Consultation introuvable</h2>
          <p className="text-sm text-muted-foreground">
            Le dossier #{consultationId} n'existe pas ou a été supprimé.
          </p>
        </div>
        <Link href="/dashboard/consultations">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retourner à la liste
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-900 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-6">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-md shadow-inner border border-white/20">
              <FileText className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-1 text-white">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">Consultation Médicale</h1>
                <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-none">
                  {new Date(consultation.date).getFullYear()}
                </Badge>
              </div>
              <p className="opacity-90 font-light flex items-center gap-2">
                <span className="font-medium">{consultation.patient.firstName} {consultation.patient.lastName} </span>
                • <span className="opacity-75">{consultation.patient.nationalityID}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/consultations">
              <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-md">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
              </Button>
            </Link>
            {canEdit && (
              <Link href={`/dashboard/consultations/${consultationId}/edit`}>
                <Button className="bg-white text-emerald-900 hover:bg-white/90 shadow-lg font-semibold">
                  <Pencil className="mr-2 h-4 w-4" /> Modifier
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full justify-start rounded-xl border border-border/50 bg-white/40 p-1 backdrop-blur-xl dark:bg-slate-900/40">
          <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800">
            Détails & Diagnostic
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800">
            Prescriptions ({consultation.prescriptions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Information Card */}
            <Card className="col-span-2 border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-emerald-600" />
                  Informations Cliniques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Date</Label>
                    <div className="flex items-center gap-2 font-medium">
                      <Calendar className="h-4 w-4 text-emerald-500" />
                      {new Date(consultation.date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Heure & Durée</Label>
                    <div className="flex items-center gap-2 font-medium">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      {new Date(consultation.date).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })} • {consultation.duration} min
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Médecin</Label>
                    <div className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
                      <User className="h-4 w-4" />
                      Dr. {consultation.doctor.username || consultation.doctor.lastName}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-slate-50 p-4 dark:bg-slate-900/50">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Diagnostic</Label>
                  <p className="text-lg font-medium leading-relaxed">{consultation.diagnosis}</p>
                </div>

                {consultation.notes && (
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Notes Médicales</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-white/50 dark:bg-slate-900/30 p-4 rounded-lg border border-border/50 italic">
                      "{consultation.notes}"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary/Cost Card */}
            <Card className="border-border/50 bg-gradient-to-br from-white to-emerald-50/50 backdrop-blur-xl dark:from-slate-950 dark:to-emerald-950/10 shadow-sm h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Résumé Financier</CardTitle>
                <CardDescription>Coût de la consultation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center py-6 border-b border-border/50 border-dashed">
                  <span className="text-4xl font-black text-emerald-600 drop-shadow-sm">{consultation.price.toFixed(2)} $</span>
                  <span className="text-sm font-medium text-muted-foreground mt-1">Montant total</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">Payé</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Méthode</span>
                    <span className="font-medium">Direct</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <Copy className="mr-2 h-4 w-4" /> Imprimer Reçu
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-6">
          {consultation.prescriptions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {consultation.prescriptions.map((prescription) => (
                <Card key={prescription.id} className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm hover:border-emerald-500/30 transition-all group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <FileText className="h-4 w-4" />
                        </div>
                        Ordonnance
                      </CardTitle>
                      <Badge variant="secondary" className="font-mono text-xs">{prescription.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Médicaments</Label>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {prescription.medications.map(med => (
                          <Badge key={med.id} variant="outline" className="bg-white dark:bg-slate-900">
                            {med.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                      <div>
                        <span className="text-muted-foreground text-xs block mb-1">Dosage</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{prescription.dosage}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs block mb-1">Durée</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{prescription.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-slate-100 p-3 mb-4 dark:bg-slate-800">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Aucune prescription</h3>
                <p className="text-muted-foreground max-w-sm mt-1">
                  Aucune ordonnance n'a été délivrée lors de cette consultation.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
