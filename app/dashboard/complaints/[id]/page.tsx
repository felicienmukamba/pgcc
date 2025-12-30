"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { notFound, useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Calendar,
  User,
  Shield,
  AlertTriangle,
  FileText,
  Gavel,
  Pen,
  Users,
  Paperclip,
  Loader2,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react"

interface Complaint {
  id: string
  date: string
  type: string
  status: string
  place: string
  description: string
  plaintiff: {
    id: string
    firstName: string
    lastName: string
    phoneNumber: string
    nationalityID: string
  }
  accused?: {
    id: string
    firstName: string
    lastName: string
    phoneNumber: string
  }
  policeOfficer: {
    id: string
    username: string
    email: string
  }
  witnesses?: boolean
  evidence?: boolean
}

export default function ComplaintDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const complaintId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: session, status } = useSession();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  const canEditComplaint = session?.user?.roles?.some((role) =>
    ["ADMIN", "OPJ"].includes(role)
  )

  const fetchComplaint = useCallback(async () => {
    if (!complaintId) return;
    try {
      const response = await fetch(`/api/complaints/${complaintId}`);
      if (response.status === 404) {
        setComplaint(null);
        return;
      }
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setComplaint(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la plainte",
        variant: "destructive"
      })
    } finally {
      setLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    if (status !== "loading") fetchComplaint();
  }, [status, fetchComplaint]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <p className="text-sm text-muted-foreground animate-pulse">Chargement du dossier...</p>
        </div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
          <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">Plainte introuvable</h2>
          <p className="text-sm text-muted-foreground">Le dossier #{complaintId} est inaccessible.</p>
        </div>
        <Link href="/dashboard/complaints">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
        </Link>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "IN_PROGRESS": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "RESOLVED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "REJECTED": return "bg-red-500/10 text-red-500 border-red-500/20"
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="h-3.5 w-3.5 mr-1" />
      case "IN_PROGRESS": return <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
      case "RESOLVED": return <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
      case "REJECTED": return <XCircle className="h-3.5 w-3.5 mr-1" />
      default: return <AlertCircle className="h-3.5 w-3.5 mr-1" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "En attente"
      case "IN_PROGRESS": return "En cours de traitement"
      case "RESOLVED": return "Résolue"
      case "REJECTED": return "Rejetée"
      default: return status
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 to-red-900 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-6">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-md shadow-inner border border-white/20">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-1 text-white">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">Dossier Plainte</h1>
                <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-none">
                  #{complaint.id.slice(0, 8).toUpperCase()}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium opacity-90">
                <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  <Calendar className="h-4 w-4" />
                  {new Date(complaint.date).toLocaleDateString("fr-FR")}
                </span>
                <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  <MapPin className="h-4 w-4" />
                  {complaint.place}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/complaints">
              <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-md">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
              </Button>
            </Link>
            {canEditComplaint && (
              <Link href={`/dashboard/complaints/${complaint.id}/edit`}>
                <Button className="bg-white text-orange-900 hover:bg-white/90 shadow-lg font-semibold">
                  <Pen className="mr-2 h-4 w-4" /> Modifier
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Status Card */}
        <Card className="md:col-span-3 border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
                <Gavel className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">État du dossier</h3>
                <p className="text-muted-foreground text-sm">Suivi de l'évolution de la procédure</p>
              </div>
            </div>
            <div className="flex items-center gap-6 w-full md:w-auto p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-border/50">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Type de l'infraction</p>
                <div className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  {complaint.type}
                </div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Statut Actuel</p>
                <Badge variant="outline" className={`${getStatusColor(complaint.status)}`}>
                  {getStatusIcon(complaint.status)} {getStatusLabel(complaint.status)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plaintiff Card */}
        <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Plaignant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {complaint.plaintiff.firstName[0]}
              </div>
              <div>
                <p className="font-semibold text-lg">{complaint.plaintiff.firstName} {complaint.plaintiff.lastName}</p>
                <p className="text-sm text-muted-foreground">ID: {complaint.plaintiff.nationalityID}</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Téléphone</span>
                <span className="font-medium">{complaint.plaintiff.phoneNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accused Card */}
        <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-orange-500" />
              Accusé / Suspect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {complaint.accused ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                    {complaint.accused.firstName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{complaint.accused.firstName} {complaint.accused.lastName}</p>
                    <p className="text-sm text-muted-foreground">Suspect principal</p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Téléphone</span>
                    <span className="font-medium">{complaint.accused.phoneNumber}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <User className="h-10 w-10 opacity-20 mb-2" />
                <p>Aucun accusé identifié</p>
                <p className="text-xs">Plainthe contre X</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Officer Card */}
        <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-500" />
              OPJ en charge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-lg">{complaint.policeOfficer.username}</p>
                <p className="text-sm text-muted-foreground">Officier Instruction</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm space-y-2">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Email</span>
                <span className="font-medium truncate">{complaint.policeOfficer.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description & Details */}
        <Card className="md:col-span-2 border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Déposition & Faits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300 p-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-border/50">
              {complaint.description}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-purple-600" />
              Éléments du dossier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Témoins</span>
              </div>
              <Badge variant={complaint.witnesses ? "default" : "outline"}>
                {complaint.witnesses ? "Oui" : "Non"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <Paperclip className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Preuves matérielles</span>
              </div>
              <Badge variant={complaint.evidence ? "default" : "outline"}>
                {complaint.evidence ? "Oui" : "Non"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
