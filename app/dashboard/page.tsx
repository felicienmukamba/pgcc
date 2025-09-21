import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Heart, Shield } from "lucide-react"

async function getDashboardStats() {
  const [citizensCount, birthRecordsCount, consultationsCount, complaintsCount] = await Promise.all([
    prisma.citizen.count(),
    prisma.birthRecord.count(),
    prisma.consultation.count(),
    prisma.complaint.count(),
  ])

  return {
    citizensCount,
    birthRecordsCount,
    consultationsCount,
    complaintsCount,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const stats = await getDashboardStats()

  const cards = [
    {
      title: "Citoyens enregistrés",
      value: stats.citizensCount,
      description: "Total des citoyens dans le système",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Actes de naissance",
      value: stats.birthRecordsCount,
      description: "Actes enregistrés ce mois",
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Consultations médicales",
      value: stats.consultationsCount,
      description: "Consultations enregistrées",
      icon: Heart,
      color: "text-red-600",
    },
    {
      title: "Plaintes déposées",
      value: stats.complaintsCount,
      description: "Plaintes en cours de traitement",
      icon: Shield,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">Bienvenue, {session?.user?.username}. Voici un aperçu de votre système.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
            <CardDescription>Dernières actions effectuées dans le système</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Nouveau citoyen enregistré</p>
                  <p className="text-sm text-muted-foreground">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Acte de naissance créé</p>
                  <p className="text-sm text-muted-foreground">Il y a 4 heures</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Consultation médicale enregistrée</p>
                  <p className="text-sm text-muted-foreground">Il y a 6 heures</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Accès rapide</CardTitle>
            <CardDescription>Actions fréquemment utilisées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-col gap-2">
              <button className="flex items-center justify-start p-2 text-sm hover:bg-muted rounded-md">
                <Users className="mr-2 h-4 w-4" />
                Nouveau citoyen
              </button>
              <button className="flex items-center justify-start p-2 text-sm hover:bg-muted rounded-md">
                <FileText className="mr-2 h-4 w-4" />
                Nouvel acte de naissance
              </button>
              <button className="flex items-center justify-start p-2 text-sm hover:bg-muted rounded-md">
                <Heart className="mr-2 h-4 w-4" />
                Nouvelle consultation
              </button>
              <button className="flex items-center justify-start p-2 text-sm hover:bg-muted rounded-md">
                <Shield className="mr-2 h-4 w-4" />
                Nouvelle plainte
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
