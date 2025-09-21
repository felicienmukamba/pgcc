import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { RoleGuard } from "@/components/auth/role-guard"

async function getCitizens() {
  return await prisma.citizen.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  })
}

export default async function CitizensPage() {
  const citizens = await getCitizens()

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "MALE":
        return "Homme"
      case "FEMALE":
        return "Femme"
      case "OTHER":
        return "Autre"
      default:
        return gender
    }
  }

  const getMaritalStatusLabel = (status: string) => {
    switch (status) {
      case "SINGLE":
        return "Célibataire"
      case "MARRIED":
        return "Marié(e)"
      case "DIVORCED":
        return "Divorcé(e)"
      case "WIDOWED":
        return "Veuf/Veuve"
      default:
        return status
    }
  }

  return (
    <RoleGuard module="citizens">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des citoyens</h1>
            <p className="text-muted-foreground">Gérez les informations des citoyens enregistrés</p>
          </div>
          <RoleGuard permission="citizens.write">
            <Link href="/dashboard/citizens/new">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Nouveau citoyen
              </Button>
            </Link>
          </RoleGuard>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recherche et filtres</CardTitle>
            <CardDescription>Trouvez rapidement un citoyen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input placeholder="Rechercher par nom, prénom, ou ID national..." className="w-full" />
              </div>
              <Button variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtres
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {citizens.map((citizen) => (
            <Card key={citizen.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {citizen.firstName[0]}
                        {citizen.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {citizen.firstName} {citizen.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">ID: {citizen.nationalityID}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{getGenderLabel(citizen.gender)}</Badge>
                        <Badge variant="outline">{getMaritalStatusLabel(citizen.maritalStatus)}</Badge>
                        <Badge variant={citizen.nationality === "NATIONAL" ? "default" : "secondary"}>
                          {citizen.nationality === "NATIONAL" ? "National" : "Étranger"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Né(e) le {new Date(citizen.birthDate).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-sm text-muted-foreground">à {citizen.birthPlace}</p>
                    <div className="mt-2">
                      <Link href={`/dashboard/citizens/${citizen.id}`}>
                        <Button variant="outline" size="sm">
                          Voir détails
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {citizens.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun citoyen enregistré</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par enregistrer votre premier citoyen dans le système.
              </p>
              <RoleGuard permission="citizens.write">
                <Link href="/dashboard/citizens/new">
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Nouveau citoyen
                  </Button>
                </Link>
              </RoleGuard>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  )
}
