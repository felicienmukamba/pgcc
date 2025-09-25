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
  MapPin,
  HeartHandshake,
  Users,
  Pen,
} from "lucide-react"

interface MarriageRecordDetailsPageProps {
  params: {
    id: string
  }
}

async function getMarriageRecord(id: string) {
  return await prisma.marriageRecord.findUnique({
    where: {
      id,
    },
    include: {
      partner1: true,
      partner2: true,
      officiant: true,
      witness1: true,
      witness2: true,
      witness3: true,
    },
  })
}

export default async function MarriageRecordDetailsPage({ params }: MarriageRecordDetailsPageProps) {
  const session = await getServerSession(authOptions)
  const marriageRecord = await getMarriageRecord(params.id)

  if (!marriageRecord) {
    notFound()
  }

  // Check if user can edit marriage records
  const canEditMarriageRecord = session?.user?.roles?.some((role) =>
    ["ADMIN", "OFFICIER_ETAT_CIVIL"].includes(role)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/marriage-records">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Détails de l'acte de mariage</h1>
            <p className="text-muted-foreground">Acte #{marriageRecord.id.slice(-8)}</p>
          </div>
        </div>
        {canEditMarriageRecord && (
          <Link href={`/dashboard/marriage-records/${marriageRecord.id}/edit`}>
            <Button variant="outline">
              <Pen className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <HeartHandshake className="h-5 w-5 text-primary" />
              Informations sur le mariage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Date:</span>
              <span>{new Date(marriageRecord.marriageDate).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Lieu:</span>
              <span>{marriageRecord.marriagePlace}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">{marriageRecord.marriageType}</Badge>
            </div>
            {marriageRecord.contractType && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Régime:</span>
                <span>{marriageRecord.contractType}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              Époux et Officier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Époux 1:</span>
              <span className="text-base font-semibold">
                {marriageRecord.partner1.firstName} {marriageRecord.partner1.lastName}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Époux 2:</span>
              <span className="text-base font-semibold">
                {marriageRecord.partner2.firstName} {marriageRecord.partner2.lastName}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Officier:</span>
              <span className="text-base font-semibold">{marriageRecord.officiant.username}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Témoins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Témoin 1:</span>
              <span className="text-base font-semibold">
                {marriageRecord.witness1.firstName} {marriageRecord.witness1.lastName}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Témoin 2:</span>
              <span className="text-base font-semibold">
                {marriageRecord.witness2.firstName} {marriageRecord.witness2.lastName}
              </span>
            </div>
            {marriageRecord.witness3 && (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">Témoin 3:</span>
                <span className="text-base font-semibold">
                  {marriageRecord.witness3.firstName} {marriageRecord.witness3.lastName}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
