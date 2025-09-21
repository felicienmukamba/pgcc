import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, UserPlus, Shield, Link } from "lucide-react"
import { RoleGuard } from "@/components/auth/role-guard"

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  })
}

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  const users = await getUsers()

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
      case "CIVIL_SERVANT":
        return "default"
      case "MEDICAL_STAFF":
        return "secondary"
      case "SECURITY_STAFF":
        return "outline"
      case "VIEWER":
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
                <Input placeholder="Rechercher par nom d'utilisateur ou email..." className="w-full" />
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                  <SelectItem value="CIVIL_SERVANT">Fonctionnaire</SelectItem>
                  <SelectItem value="MEDICAL_STAFF">Personnel médical</SelectItem>
                  <SelectItem value="SECURITY_STAFF">Personnel sécurité</SelectItem>
                  <SelectItem value="VIEWER">Observateur</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Button>
            </div>
          </CardContent>
        </Card>

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
                          Modifier
                        </Button>
                      </RoleGuard>
                      <Button variant="outline" size="sm">
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
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
