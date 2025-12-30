import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Pill } from "lucide-react"

export const dynamic = 'force-dynamic';

async function getPrescriptions() {
  const prescriptions = await prisma.prescription.findMany({
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
  })
  return prescriptions
}

export default async function PrescriptionsPage() {
  const prescriptions = await getPrescriptions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions Médicales</h1>
          <p className="text-muted-foreground">Registre des ordonnances et délivrances de médicaments</p>
        </div>
      </div>

      <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
              <Pill className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Dossiers de Prescription</CardTitle>
              <CardDescription>Liste complète des prescriptions émises</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Chargement...</div>}>
            <DataTable columns={columns} data={prescriptions} searchKey="consultation.patient.lastName" />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
