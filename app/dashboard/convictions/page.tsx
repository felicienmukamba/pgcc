import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Gavel } from "lucide-react"
import Link from "next/link"
import { columns } from "./columns"

async function getConvictions() {
  const convictions = await prisma.conviction.findMany({
    include: {
      citizen: true,
      prosecutor: true,
    },
    orderBy: {
      date: "desc",
    },
  })

  return convictions
}

export default async function ConvictionsPage() {
  const session = await getServerSession(authOptions)
  const convictions = await getConvictions()
  const canCreateConviction = session?.user?.roles?.includes("PROCUREUR")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Casier Judiciaire</h1>
          <p className="text-muted-foreground">Registre central des condamnations et décisions de justice</p>
        </div>
        {canCreateConviction && (
          <Link href="/dashboard/convictions/new">
            <Button className="font-semibold shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Condamnation
            </Button>
          </Link>
        )}
      </div>

      <Card className="border-border/50 bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl">
              <Gavel className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle>Dossiers de Condamnation</CardTitle>
              <CardDescription>Liste complète des casiers judiciaires enregistrés</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Chargement...</div>}>
            <DataTable columns={columns} data={convictions} searchKey="citizen.lastName" />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
