import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  User,
  Gavel,
  Scale,
  DollarSign,
  Info,
  Clock,
  Briefcase,
  AlertCircle,
} from "lucide-react"

async function getConvictionDetails(id: string) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const conviction = await prisma.conviction.findUnique({
    where: { id },
    include: {
      citizen: true,
      prosecutor: true,
    },
  })

  // Return null if no conviction is found or if the user doesn't have the necessary role
  if (!conviction || !session.user.roles.some(role => ["ADMIN", "PROCUREUR", "POLICE"].includes(role))) {
    return null
  }

  return conviction
}

// Re-using your existing helper functions for badges
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

export default async function ConvictionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const conviction = await getConvictionDetails(params.id)

  if (!conviction) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Détails de la condamnation</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            Condamnation de {conviction.citizen.firstName} {conviction.citizen.lastName}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={getSentenceTypeColor(conviction.sentenceType)}>
              {getSentenceTypeLabel(conviction.sentenceType)}
            </Badge>
            {conviction.appealStatus !== "NONE" && (
              <Badge className={getAppealStatusColor(conviction.appealStatus)}>
                {getAppealStatusLabel(conviction.appealStatus)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de la condamnation</p>
                <p>{new Date(conviction.date).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Gavel className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tribunal</p>
                <p>{conviction.court}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Scale className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Juridiction</p>
                <p>{conviction.jurisdiction}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Procureur</p>
                <p>{conviction.prosecutor.username}</p>
              </div>
            </div>
            {conviction.duration && (
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Durée</p>
                  <p>{conviction.duration}</p>
                </div>
              </div>
            )}
            {conviction.fineAmount && (
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amende</p>
                  <p>{conviction.fineAmount.toFixed(2)} €</p>
                </div>
              </div>
            )}
            {conviction.startDate && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Début de peine</p>
                  <p>{new Date(conviction.startDate).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            )}
            {conviction.endDate && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fin de peine</p>
                  <p>{new Date(conviction.endDate).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Nature de l'infraction</p>
              </div>
              <p className="pl-7">{conviction.offenseNature}</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Gavel className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Sentence</p>
              </div>
              <p className="pl-7">{conviction.sentence}</p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Statut:</p>
              <Badge variant="outline">{conviction.status}</Badge>
            </div>
            {conviction.paroleStatus && (
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Libération conditionnelle:</p>
                <Badge variant="outline">
                  {conviction.paroleStatus === "ELIGIBLE"
                    ? "Éligible"
                    : conviction.paroleStatus === "GRANTED"
                    ? "Accordée"
                    : "Refusée"}
                </Badge>
              </div>
            )}
            {conviction.rehabilitationStatus && (
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Réhabilitation:</p>
                <Badge variant="outline">
                  {conviction.rehabilitationStatus === "PENDING" ? "En cours" : "Terminée"}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}