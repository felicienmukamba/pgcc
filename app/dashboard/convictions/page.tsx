import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, Calendar, User, Gavel, AlertCircle } from "lucide-react"

async function getConvictions() {
  return await prisma.conviction.findMany({
    include: {
      citizen: true,
      prosecutor: true,
    },
    orderBy: {
      date: "desc",
    },
    take: 20,
  })
}

export default async function ConvictionsPage() {
  const session = await getServerSession(authOptions)
  const convictions = await getConvictions()

  // Check if user can create convictions
  const canCreateConviction = session?.user?.roles?.includes("PROCUREUR")

  const getSentenceTypeColor = (type: string) => {
    switch (type) {
      case "IMPRISONMENT":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "FINE":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "COMMUNITY_SERVICE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getSentenceTypeLabel = (type: string) => {
    switch (type) {
      case "IMPRISONMENT":
        return "Emprisonnement"
      case "FINE":
        return "Amende"
      case "COMMUNITY_SERVICE":
        return "Travaux d'intérêt général"
      default:
        return type
    }
  }

  const getAppealStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
      case "ACCEPTED":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "NONE":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getAppealStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Appel en cours"
      case "ACCEPTED":
        return "Appel accepté"
      case "REJECTED":
        return "Appel rejeté"
      case "NONE":
        return "Pas d'appel"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Casier judiciaire</h1>
          <p className="text-muted-foreground">Gérez les condamnations et le casier judiciaire</p>
        </div>
        {canCreateConviction && (
          <Link href="/dashboard/convictions/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle condamnation
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recherche et filtres</CardTitle>
          <CardDescription>Trouvez rapidement une condamnation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Rechercher par nom, tribunal, ou nature de l'infraction..." className="w-full" />
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
        {convictions.map((conviction) => (
          <Card key={conviction.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <Gavel className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {conviction.citizen.firstName} {conviction.citizen.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">ID: {conviction.citizen.nationalityID}</p>
                    </div>
                    <Badge className={getSentenceTypeColor(conviction.sentenceType)}>
                      {getSentenceTypeLabel(conviction.sentenceType)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(conviction.date).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Procureur: {conviction.prosecutor.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gavel className="h-4 w-4 text-muted-foreground" />
                      <span>{conviction.court}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Nature de l'infraction:</span>
                      <p className="text-sm mt-1">{conviction.offenseNature}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Sentence:</span>
                      <p className="text-sm mt-1">{conviction.sentence}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm">
                    {conviction.duration && (
                      <div>
                        <span className="text-muted-foreground">Durée:</span>
                        <span className="ml-1 font-medium">{conviction.duration}</span>
                      </div>
                    )}
                    {conviction.fineAmount && (
                      <div>
                        <span className="text-muted-foreground">Amende:</span>
                        <span className="ml-1 font-medium">{conviction.fineAmount.toFixed(2)} €</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Statut:</span>
                      <span className="ml-1 font-medium">{conviction.status}</span>
                    </div>
                  </div>

                  {conviction.appealStatus !== "NONE" && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <Badge className={getAppealStatusColor(conviction.appealStatus)}>
                        {getAppealStatusLabel(conviction.appealStatus)}
                      </Badge>
                    </div>
                  )}

                  {(conviction.paroleStatus || conviction.rehabilitationStatus) && (
                    <div className="flex gap-4 text-sm">
                      {conviction.paroleStatus && (
                        <div>
                          <span className="text-muted-foreground">Libération conditionnelle:</span>
                          <Badge variant="outline" className="ml-1">
                            {conviction.paroleStatus === "ELIGIBLE"
                              ? "Éligible"
                              : conviction.paroleStatus === "GRANTED"
                                ? "Accordée"
                                : "Refusée"}
                          </Badge>
                        </div>
                      )}
                      {conviction.rehabilitationStatus && (
                        <div>
                          <span className="text-muted-foreground">Réhabilitation:</span>
                          <Badge variant="outline" className="ml-1">
                            {conviction.rehabilitationStatus === "PENDING" ? "En cours" : "Terminée"}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right space-y-2">
                  <Link href={`/dashboard/convictions/${conviction.id}`}>
                    <Button variant="outline" size="sm">
                      Voir détails
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {convictions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Gavel className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune condamnation enregistrée</h3>
            <p className="text-muted-foreground mb-4">
              {canCreateConviction
                ? "Commencez par enregistrer votre première condamnation."
                : "Aucune condamnation n'a été enregistrée dans le système."}
            </p>
            {canCreateConviction && (
              <Link href="/dashboard/convictions/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle condamnation
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
