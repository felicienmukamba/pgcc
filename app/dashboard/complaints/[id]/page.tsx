import Link from "next/link"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"

interface ComplaintDetailsPageProps {
  params: {
    id: string
  }
}

async function getComplaint(id: string) {
  return await prisma.complaint.findUnique({
    where: {
      id,
    },
    include: {
      plaintiff: true,
      accused: true,
      policeOfficer: true,
    },
  })
}

export default async function ComplaintDetailsPage({ params }: ComplaintDetailsPageProps) {
  const session = await getServerSession(authOptions)
  const complaint = await getComplaint(params.id)

  if (!complaint) {
    notFound()
  }

  // Check if user can edit complaints
  const canEditComplaint = session?.user?.roles?.some((role) =>
    ["ADMIN", "OPJ"].includes(role)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "RESOLVED":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "En attente"
      case "IN_PROGRESS":
        return "En cours"
      case "RESOLVED":
        return "Résolue"
      case "REJECTED":
        return "Rejetée"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/complaints">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Détails de la plainte</h1>
            <p className="text-muted-foreground">Plainte #{complaint.id.slice(-8)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {canEditComplaint && (
            <Link href={`/dashboard/complaints/${complaint.id}/edit`}>
              <Button variant="outline">
                <Pen className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </Link>
          )}
          <Badge className={getStatusColor(complaint.status)}>
            {getStatusLabel(complaint.status)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Informations sur la plainte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Date:</span>
              <span>{new Date(complaint.date).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Gavel className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Type:</span>
              <span>{complaint.type}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Lieu:</span>
              <span>{complaint.place}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              Parties impliquées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Plaignant:</span>
              <span className="text-base font-semibold">
                {complaint.plaintiff.firstName} {complaint.plaintiff.lastName}
              </span>
              <span className="text-sm text-muted-foreground">{complaint.plaintiff.phoneNumber}</span>
            </div>
            {complaint.accused && (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">Accusé:</span>
                <span className="text-base font-semibold">
                  {complaint.accused.firstName} {complaint.accused.lastName}
                </span>
                <span className="text-sm text-muted-foreground">{complaint.accused.phoneNumber}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Responsable de l'affaire
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">Officier de police judiciaire:</span>
            <span className="text-base font-semibold">{complaint.policeOfficer.username}</span>
            <span className="text-sm text-muted-foreground">{complaint.policeOfficer.email}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-500" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-gray-700 dark:text-gray-300">{complaint.description}</p>
        </CardContent>
      </Card>

      {(complaint.witnesses || complaint.evidence) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Détails complémentaires
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaint.witnesses && (
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Présence de témoins:</span>
                <Badge variant="outline" className="w-fit">
                  Oui
                </Badge>
              </div>
            )}
            {complaint.evidence && (
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Présence de preuves:</span>
                <Badge variant="outline" className="w-fit">
                  Oui
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
