import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Calendar, User, Pill } from "lucide-react"

export const dynamic = 'force-dynamic';

async function getPrescriptions() {
  return await prisma.prescription.findMany({
    include: {
      consultation: {
        include: {
          patient: true,
          doctor: true,
        },
      },
      medications: true,
    },
    orderBy: {
      date: "desc",
    },
    take: 20,
  })
}

export default async function PrescriptionsPage() {
  const prescriptions = await getPrescriptions()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "Active"
      case "completed":
        return "Terminée"
      case "cancelled":
        return "Annulée"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions médicales</h1>
          <p className="text-muted-foreground">Gérez les prescriptions et médicaments</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recherche et filtres</CardTitle>
          <CardDescription>Trouvez rapidement une prescription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Rechercher par patient, médecin, ou médicament..." className="w-full" />
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
        {prescriptions.map((prescription) => (
          <Card key={prescription.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {prescription.consultation?.patient.firstName} {prescription.consultation?.patient.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ID: {prescription.consultation?.patient.nationalityID}
                      </p>
                    </div>
                    <Badge className={getStatusColor(prescription.status)}>{getStatusLabel(prescription.status)}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(prescription.date).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Dr. {prescription.consultation?.doctor.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Durée:</span>
                      <span>{prescription.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Quantité:</span>
                      <span>{prescription.quantity}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Posologie:</span>
                      <p className="text-sm mt-1">{prescription.dosage}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Médicaments prescrits:</span>
                    <div className="flex flex-wrap gap-2">
                      {prescription.medications.map((medication) => (
                        <Badge key={medication.id} variant="outline">
                          {medication.tradeName}
                          {medication.dosage && ` - ${medication.dosage}${medication.unit}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <Link href={`/dashboard/prescriptions/${prescription.id}`}>
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

      {prescriptions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Pill className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune prescription enregistrée</h3>
            <p className="text-muted-foreground mb-4">
              Les prescriptions apparaîtront ici une fois qu'elles seront créées lors des consultations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
