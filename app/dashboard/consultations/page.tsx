import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, Calendar, User, FileText } from "lucide-react"
import { RoleGuard } from "@/components/auth/role-guard"

async function getConsultations() {
  return await prisma.consultation.findMany({
    include: {
      doctor: true,
      patient: true,
      prescriptions: {
        include: {
          medications: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: 20,
  })
}

export default async function ConsultationsPage() {
  const session = await getServerSession(authOptions)
  const consultations = await getConsultations()

  return (
    <RoleGuard module="consultations">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Consultations médicales</h1>
            <p className="text-muted-foreground">Gérez les consultations et dossiers médicaux</p>
          </div>
          <RoleGuard permission="consultations.write">
            <Link href="/dashboard/consultations/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle consultation
              </Button>
            </Link>
          </RoleGuard>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recherche et filtres</CardTitle>
            <CardDescription>Trouvez rapidement une consultation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input placeholder="Rechercher par patient, médecin, ou diagnostic..." className="w-full" />
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
          {consultations.map((consultation) => (
            <Card key={consultation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {consultation.patient.firstName} {consultation.patient.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">ID: {consultation.patient.nationalityID}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(consultation.date).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Dr. {consultation.doctor.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Durée:</span>
                        <span>{consultation.duration}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Diagnostic:</span>
                        <p className="text-sm mt-1">{consultation.diagnosis}</p>
                      </div>
                      {consultation.notes && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Notes:</span>
                          <p className="text-sm mt-1 text-muted-foreground">{consultation.notes}</p>
                        </div>
                      )}
                    </div>

                    {consultation.prescriptions.length > 0 && (
                      <div className="flex gap-2">
                        <Badge variant="secondary">{consultation.prescriptions.length} prescription(s)</Badge>
                        <Badge variant="outline">
                          {consultation.prescriptions.reduce((acc, p) => acc + p.medications.length, 0)} médicament(s)
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="text-right space-y-2">
                    <div className="text-lg font-semibold text-primary">{consultation.price.toFixed(2)} €</div>
                    <Link href={`/dashboard/consultations/${consultation.id}`}>
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

        {consultations.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucune consultation enregistrée</h3>
              <p className="text-muted-foreground mb-4">Aucune consultation n'a été enregistrée dans le système.</p>
              <RoleGuard permission="consultations.write">
                <Link href="/dashboard/consultations/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle consultation
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
