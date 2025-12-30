"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { RoleGuard } from "@/components/auth/role-guard"
import {
  ArrowLeft,
  Calendar,
  User,
  Shield,
  Mail,
  Loader2,
  Clock,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Key,
  ShieldAlert,
  Edit
} from "lucide-react"

interface UserData {
  id: string
  username: string
  email: string
  roles: string[]
  enabled: boolean
  createdAt: string
  updatedAt: string | null
  isUsing2FA: boolean
  accountNonLocked: boolean
  accountNonExpired: boolean
  credentialsNonExpired: boolean
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case "ADMIN": return "Administrateur";
    case "OFFICIER_ETAT_CIVIL": return "Officier d'État Civil";
    case "MEDECIN": return "Médecin";
    case "OPJ": return "Officier de Police Judiciaire";
    case "PROCUREUR": return "Procureur";
    case "CITOYEN": return "Citoyen";
    case "VIEWER": return "Observateur";
    default: return role;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "ADMIN": return "destructive";
    case "OFFICIER_ETAT_CIVIL": return "default";
    case "MEDECIN": return "secondary";
    case "OPJ": return "outline";
    case "PROCUREUR": return "default"; // Changed for visibility
    case "CITOYEN": return "outline";
    case "VIEWER": return "secondary";
    default: return "outline";
  }
};

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.status === 404) {
        setUser(null);
        return;
      }
      if (!response.ok) throw new Error("Erreur");
      const data = await response.json();
      setUser(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'utilisateur",
        variant: "destructive"
      })
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (status !== "loading") fetchUser();
  }, [status, fetchUser]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
          <User className="h-6 w-6 text-slate-500" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">Utilisateur introuvable</h2>
          <p className="text-sm text-muted-foreground">Le compte #{userId} n'existe pas ou a été supprimé.</p>
        </div>
        <Link href="/dashboard/users">
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-900 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/20 flex items-center justify-center text-3xl font-bold text-white">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="space-y-2 text-white">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{user.username}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.roles.map(role => (
                    <Badge key={role} className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-none">
                      {getRoleLabel(role)}
                    </Badge>
                  ))}
                  <Badge variant={user.enabled ? "default" : "destructive"} className={user.enabled ? "bg-emerald-500/80 hover:bg-emerald-500 text-white border-0" : "bg-red-500/80 hover:bg-red-500 text-white border-0"}>
                    {user.enabled ? "Compte Actif" : "Compte Bloqué"}
                  </Badge>
                </div>
              </div>
              <p className="opacity-90 font-light flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/users">
              <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-md">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
              </Button>
            </Link>
            <RoleGuard permission="users.write">
              <Link href={`/dashboard/users/${user.id}/edit`}>
                <Button className="bg-white text-indigo-900 hover:bg-white/90 shadow-lg font-semibold">
                  <Edit className="mr-2 h-4 w-4" /> Modifier
                </Button>
              </Link>
            </RoleGuard>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start rounded-xl border border-border/50 bg-white/40 p-1 backdrop-blur-xl dark:bg-slate-900/40">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800">
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800">
            Sécurité & Accès
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-500" />
                  Informations Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-border/50">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Nom d'utilisateur</p>
                    <p className="font-semibold text-lg">{user.username}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-border/50">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Adresse Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-500" />
                  Activité du Compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Création du compte</p>
                      <p className="text-xs text-muted-foreground">Date d'inscription</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm">{new Date(user.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Dernière modification</p>
                      <p className="text-xs text-muted-foreground">Mise à jour du profil</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm">{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("fr-FR") : "Aucune"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-violet-500" />
                Sécurité & Conformité
              </CardTitle>
              <CardDescription>État actuel des mécanismes de sécurité du compte.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className={`h-5 w-5 ${user.isUsing2FA ? "text-emerald-500" : "text-orange-500"}`} />
                    <div className="space-y-0.5">
                      <p className="font-medium">Double Authentification (2FA)</p>
                      <p className="text-xs text-muted-foreground">Protection renforcée du compte</p>
                    </div>
                  </div>
                  <Badge variant={user.isUsing2FA ? "default" : "outline"} className={user.isUsing2FA ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0" : ""}>
                    {user.isUsing2FA ? "Activé" : "Désactivé"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    {user.accountNonLocked ? <Unlock className="h-5 w-5 text-emerald-500" /> : <Lock className="h-5 w-5 text-red-500" />}
                    <div className="space-y-0.5">
                      <p className="font-medium">État du Verrouillage</p>
                      <p className="text-xs text-muted-foreground">Accès au système</p>
                    </div>
                  </div>
                  <Badge variant={user.accountNonLocked ? "outline" : "destructive"} className={user.accountNonLocked ? "text-emerald-600 border-emerald-200 bg-emerald-50" : ""}>
                    {user.accountNonLocked ? "Déverrouillé" : "Verrouillé"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    {user.accountNonExpired ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                    <div className="space-y-0.5">
                      <p className="font-medium">Validité du Compte</p>
                      <p className="text-xs text-muted-foreground">Expiration du compte</p>
                    </div>
                  </div>
                  <Badge variant={user.accountNonExpired ? "outline" : "destructive"} className={user.accountNonExpired ? "text-emerald-600 border-emerald-200 bg-emerald-50" : ""}>
                    {user.accountNonExpired ? "Valide" : "Expiré"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    {user.credentialsNonExpired ? <Key className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                    <div className="space-y-0.5">
                      <p className="font-medium">Validité des Identifiants</p>
                      <p className="text-xs text-muted-foreground">Expiration du mot de passe</p>
                    </div>
                  </div>
                  <Badge variant={user.credentialsNonExpired ? "outline" : "destructive"} className={user.credentialsNonExpired ? "text-emerald-600 border-emerald-200 bg-emerald-50" : ""}>
                    {user.credentialsNonExpired ? "Valides" : "Expirés"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}