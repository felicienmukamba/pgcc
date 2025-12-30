"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, UserPlus, Shield, Loader2, Filter, Eye, Pencil } from "lucide-react"
import { RoleGuard } from "@/components/auth/role-guard"
import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

type UserData = {
  id: string;
  username: string;
  email: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string | null;
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case "ADMIN": return "Administrateur"
    case "OFFICIER_ETAT_CIVIL": return "Officier d'État Civil"
    case "MEDECIN": return "Médecin"
    case "OPJ": return "Officier de Police Judiciaire"
    case "PROCUREUR": return "Procureur"
    case "CITOYEN": return "Citoyen"
    case "VIEWER": return "Observateur"
    default: return role
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "ADMIN": return "destructive"
    case "OFFICIER_ETAT_CIVIL": return "default"
    case "MEDECIN": return "secondary"
    case "OPJ": return "outline"
    case "PROCUREUR": return "default" // Changed to default for better visibility
    case "CITOYEN": return "outline"
    case "VIEWER": return "secondary"
    default: return "outline"
  }
}

const fetchUsers = async (search = "", role = ""): Promise<UserData[]> => {
  const params = new URLSearchParams()
  if (role && role !== "all") {
    params.set("role", role)
  }
  if (search) {
    params.set("search", search)
  }

  const res = await fetch(`/api/users?${params.toString()}`)

  if (res.status === 401) {
    throw new Error("Non autorisé. Vérifiez vos permissions.")
  }
  if (!res.ok) {
    throw new Error("Échec du chargement des utilisateurs.")
  }
  return res.json()
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [pendingSearch, setPendingSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(pendingSearch)
      setCurrentPage(1) // Reset page on search
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [pendingSearch])

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchUsers(searchTerm, selectedRole)
      setUsers(data)
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur inconnue est survenue.");
      setUsers([]);
    } finally {
      setLoading(false)
    }
  }, [selectedRole, searchTerm])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const roleOptions = [
    { value: "all", label: "Tous les rôles" },
    { value: "ADMIN", label: "Administrateur" },
    { value: "OFFICIER_ETAT_CIVIL", label: "Officier d'État Civil" },
    { value: "MEDECIN", label: "Médecin" },
    { value: "OPJ", label: "Officier de Police Judiciaire" },
    { value: "PROCUREUR", label: "Procureur" },
    { value: "VIEWER", label: "Observateur" },
    { value: "CITOYEN", label: "Citoyen" },
  ];

  // Pagination logic (client-side for now as API returns filtered list)
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE)
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const columns: ColumnDef<UserData>[] = [
    {
      header: "Utilisateur",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{row.original.username}</span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        </div>
      )
    },
    {
      header: "Rôle",
      accessorKey: "roles",
      cell: ({ row }) => (
        <Badge variant={getRoleColor(row.original.roles[0] || 'VIEWER') as any} className="whitespace-nowrap">
          {getRoleLabel(row.original.roles[0] || 'VIEWER')}
        </Badge>
      )
    },
    {
      header: "Statut",
      accessorKey: "enabled",
      cell: ({ row }) => (
        <Badge variant={row.original.enabled ? "outline" : "destructive"} className={row.original.enabled ? "border-green-200 text-green-700 bg-green-50" : ""}>
          {row.original.enabled ? "Actif" : "Bloqué"}
        </Badge>
      )
    },
    {
      header: "Créé le",
      accessorKey: "createdAt",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString("fr-FR")}</span>
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <RoleGuard permission="users.write">
            <Link href={`/dashboard/users/${row.original.id}/edit`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 text-muted-foreground hover:text-slate-900 rounded-full">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          </RoleGuard>
          <Link href={`/dashboard/users/${row.original.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 text-muted-foreground hover:text-slate-900 rounded-full">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )
    }
  ]

  return (
    <RoleGuard permission="users.read">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Utilisateurs</h1>
            <p className="text-slate-500 font-medium">Administration des comptes et accès</p>
          </div>
          <RoleGuard permission="users.write">
            <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" asChild>
              <Link href="/dashboard/users/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un utilisateur
              </Link>
            </Button>
          </RoleGuard>
        </div>

        <Card className="border-border/50 shadow-sm bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Recherche
                </CardTitle>
                <CardDescription>Filtrer par nom, email ou rôle</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative group max-w-md flex-1">
                <Search className="absolute left-3 top-2.5 transform text-muted-foreground h-4 w-4 group-hover:text-primary transition-colors" />
                <Input
                  placeholder="Rechercher..."
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                  className="pl-9 bg-background/50 border-border/60 focus:border-primary/50 transition-all"
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm text-center">
            Erreur: {error} <Button variant="link" onClick={loadUsers} className="h-auto p-0">Réessayer</Button>
          </div>
        )}

        <DataTable
          columns={columns}
          data={paginatedUsers}
          isLoading={loading}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
          }}
          emptyMessage="Aucun utilisateur trouvé."
        />
      </div>
    </RoleGuard>
  )
}