"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, UserPlus, Shield, Loader2 } from "lucide-react"
import { RoleGuard } from "@/components/auth/role-guard"
import Link from "next/link"

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
    case "ADMIN":
      return "Administrateur"
    case "OFFICIER_ETAT_CIVIL":
      return "Officier d'État Civil"
    case "MEDECIN":
      return "Médecin"
    case "OPJ":
      return "Officier de Police Judiciaire"
    case "PROCUREUR":
      return "Procureur"
    case "CITOYEN":
      return "Citoyen"
    case "VIEWER":
      return "Observateur"
    default:
      return role
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "destructive"
    case "OFFICIER_ETAT_CIVIL":
      return "default"
    case "MEDECIN":
      return "secondary"
    case "OPJ":
      return "outline"
    case "PROCUREUR":
      return "primary"
    case "CITOYEN":
      return "default"
    case "VIEWER":
      return "secondary"
    default:
      return "outline"
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
  const [pendingSearch, setPendingSearch] = useState("") // Pour le debounce

  // Debounce pour la recherche
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(pendingSearch)
    }, 500) // 500ms

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
  
  return (
    <RoleGuard permission="users.read">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
            <p className="text-muted-foreground">Gérez les comptes utilisateurs et leurs permissions</p>
          </div>
          <RoleGuard permission="users.write">
            <Button asChild>
              <Link href="/dashboard/users/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un utilisateur
              </Link>
            </Button>
          </RoleGuard>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recherche et filtres</CardTitle>
            <CardDescription>Trouvez rapidement un utilisateur</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par nom d'utilisateur ou email..."
                  className="w-full"
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par rôle" />
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

        {loading && (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Chargement des utilisateurs...</p>
          </div>
        )}
        
        {error && !loading && (
          <Card>
            <CardContent className="p-6 text-center text-red-500">
              <p>Erreur: {error}</p>
              <Button onClick={loadUsers} className="mt-4">Réessayer</Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{user.username}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={getRoleColor(user.roles[0] || 'VIEWER') as any}>
                              {getRoleLabel(user.roles[0] || 'VIEWER')}
                          </Badge>
                          <Badge variant="outline">{user.enabled ? "Actif" : "Bloqué"}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Créé le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Mise à jour:{" "}
                        {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("fr-FR") : "Jamais"}
                      </p>
                      <div className="mt-2 space-x-2">
                        <RoleGuard permission="users.write">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/users/${user.id}/edit`}>Modifier</Link>
                          </Button>
                        </RoleGuard>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/users/${user.id}`}>Voir détails</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-muted-foreground mb-4">Aucun utilisateur ne correspond aux critères de recherche.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  )
}