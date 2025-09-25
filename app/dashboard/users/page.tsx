"use client"

import { useEffect, useState } from "react"
import { getServerSession } from "next-auth" // Note: This is a server-side import
import { authOptions } from "@/lib/auth" // and cannot be used in a "use client" component.
import { prisma } from "@/lib/prisma" // Same as above. You must fetch data on the client or pass it from a server component.
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, UserPlus, Shield, Link } from "lucide-react"
import { RoleGuard } from "@/components/auth/role-guard"

// This function needs to be a client-side function that fetches from the API
const fetchUsers = async (searchTerm = "", role = "") => {
  const params = new URLSearchParams()
  if (role && role !== "all") {
    params.set("role", role)
  }
  // Search by username or email logic would be added to the API route
  // if (searchTerm) {
  //   params.set("search", searchTerm);
  // }
  const res = await fetch(`/api/users?${params.toString()}`)
  if (!res.ok) {
    throw new Error("Failed to fetch users")
  }
  return res.json()
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRole, setSelectedRole] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        const data = await fetchUsers(searchTerm, selectedRole)
        setUsers(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [selectedRole, searchTerm]) // Re-fetch when role or search term changes

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrateur"
      case "CIVIL_SERVANT":
        return "Fonctionnaire"
      case "MEDICAL_STAFF":
        return "Personnel médical"
      case "SECURITY_STAFF":
        return "Personnel sécurité"
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
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <RoleGuard permission="users.read">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
            <p className="text-muted-foreground">Gérez les comptes utilisateurs et leurs permissions</p>
          </div>
          <RoleGuard permission="users.write">
            <Button>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                  <SelectItem value="OFFICIER_ETAT_CIVIL">Fonctionnaire</SelectItem>
                  <SelectItem value="MEDECIN">Personnel médical</SelectItem>
                  <SelectItem value="OPJ">Personnel sécurité</SelectItem>
                  <SelectItem value="PROCUREUR">Personnel Justice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p>Erreur: {error}</p>
        ) : (
          <div className="grid gap-4">
            {users.map((user: any) => (
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
                          <Badge variant={getRoleColor(user.roles[0]) as any}>{getRoleLabel(user.roles[0])}</Badge>
                          <Badge variant="outline">{user.enabled ? "Actif" : "Inactif"}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Créé le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Dernière connexion:{" "}
                        {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("fr-FR") : "Jamais"}
                      </p>
                      <div className="mt-2 space-x-2">
                        <RoleGuard permission="users.write">
                          <Button variant="outline" size="sm">
                            <Link href={`/dashboard/users/${user.id}`}>Modifier</Link>
                          </Button>
                        </RoleGuard>
                        <Button variant="outline" size="sm">
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

        {!loading && users.length === 0 && (
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