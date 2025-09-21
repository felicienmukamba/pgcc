import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, Calendar, User, Shield, AlertTriangle } from "lucide-react"

async function getComplaints() {
  return await prisma.complaint.findMany({
    include: {
      plaintiff: true,
      accused: true,
      policeOfficer: true,
    },
    orderBy: {
      date: "desc",
    },
    take: 20,
  })
}

export default async function ComplaintsPage() {
  const session = await getServerSession(authOptions)
  const complaints = await getComplaints()

  // Check if user can create complaints
  const canCreateComplaint = session?.user?.roles?.some((role) => ["ADMIN", "OPJ", "CITOYEN"].includes(role))

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

  const getPriorityIcon = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes("violence") || lowerType.includes("agression")) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    return <Shield className="h-4 w-4 text-orange-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des plaintes</h1>
          <p className="text-muted-foreground">Gérez les plaintes déposées par les citoyens</p>
        </div>
        {canCreateComplaint && (
          <Link href="/dashboard/complaints/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle plainte
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recherche et filtres</CardTitle>
          <CardDescription>Trouvez rapidement une plainte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Rechercher par plaignant, accusé, ou type de plainte..." className="w-full" />
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
        {complaints.map((complaint) => (
          <Card key={complaint.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                      {getPriorityIcon(complaint.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        Plainte #{complaint.id.slice(-8)}
                        <Badge className={getStatusColor(complaint.status)}>{getStatusLabel(complaint.status)}</Badge>
                      </h3>
                      <p className="text-sm text-muted-foreground">Type: {complaint.type}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(complaint.date).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Plaignant: {complaint.plaintiff.firstName} {complaint.plaintiff.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>OPJ: {complaint.policeOfficer.username}</span>
                    </div>
                  </div>

                  {complaint.accused && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Accusé:</span>{" "}
                      <span className="font-medium">
                        {complaint.accused.firstName} {complaint.accused.lastName}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Lieu:</span>
                      <p className="text-sm mt-1">{complaint.place}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Description:</span>
                      <p className="text-sm mt-1 line-clamp-2">{complaint.description}</p>
                    </div>
                  </div>

                  {(complaint.witnesses || complaint.evidence) && (
                    <div className="flex gap-4 text-sm">
                      {complaint.witnesses && (
                        <div>
                          <span className="text-muted-foreground">Témoins:</span>
                          <Badge variant="outline" className="ml-1">
                            Oui
                          </Badge>
                        </div>
                      )}
                      {complaint.evidence && (
                        <div>
                          <span className="text-muted-foreground">Preuves:</span>
                          <Badge variant="outline" className="ml-1">
                            Oui
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right space-y-2">
                  <Link href={`/dashboard/complaints/${complaint.id}`}>
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

      {complaints.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune plainte enregistrée</h3>
            <p className="text-muted-foreground mb-4">
              {canCreateComplaint
                ? "Commencez par enregistrer votre première plainte."
                : "Aucune plainte n'a été enregistrée dans le système."}
            </p>
            {canCreateComplaint && (
              <Link href="/dashboard/complaints/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle plainte
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
