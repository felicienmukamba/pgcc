// app/dashboard/citizens/page.tsx
import { prisma } from "@/lib/prisma"
import { RoleGuard } from "@/components/auth/role-guard"
import { UserPlus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Importez le composant client (à créer)
import { CitizensTableWrapper } from "./citizens-table-wrapper"

// Définition des types pour les paramètres de recherche
interface CitizensPageProps {
  searchParams: {
    page?: string
    search?: string
    gender?: string
    status?: string
  }
}

const ITEMS_PER_PAGE = 10 // Limite de pagination

// --- Server Data Fetching ---
async function getCitizens(
  page: number,
  searchTerm: string,
  genderFilter: string,
  statusFilter: string
) {
  const skip = (page - 1) * ITEMS_PER_PAGE

  // Construction de la clause WHERE basée sur la recherche et les filtres
  const where: any = {
    // Recherche
    ...(searchTerm && {
      OR: [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { nationalityID: { contains: searchTerm, mode: 'insensitive' } },
      ],
    }),
    // Filtre Genre
    ...(genderFilter && genderFilter !== 'ALL' && { gender: genderFilter }),
    // Filtre Statut Marital
    ...(statusFilter && statusFilter !== 'ALL' && { maritalStatus: statusFilter }),
  }

  // Utilisation de $transaction pour garantir la cohérence des données (liste + total)
  const [citizens, totalCitizens] = await prisma.$transaction([
    prisma.citizen.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.citizen.count({ where }),
  ])

  return {
    citizens,
    totalPages: Math.ceil(totalCitizens / ITEMS_PER_PAGE),
    currentPage: page,
  }
}

export default async function CitizensPage({ searchParams }: CitizensPageProps) {
  // Parsing des paramètres de recherche
  const currentPage = parseInt(searchParams.page || "1")
  const searchTerm = searchParams.search || ""
  const genderFilter = searchParams.gender || ""
  const statusFilter = searchParams.status || ""

  // Récupération des données avec filtres et pagination
  const data = await getCitizens(currentPage, searchTerm, genderFilter, statusFilter)

  return (
    <RoleGuard module="citizens">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des citoyens</h1>
            <p className="text-muted-foreground">Gérez les informations des citoyens enregistrés</p>
          </div>
          <RoleGuard permission="citizens.write">
            <Link href="/dashboard/citizens/new">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Nouveau citoyen
              </Button>
            </Link>
          </RoleGuard>
        </div>

        {/* Passage des données et des paramètres au composant client */}
        <CitizensTableWrapper 
          initialCitizens={data.citizens}
          totalPages={data.totalPages}
          currentPage={data.currentPage}
          currentSearchTerm={searchTerm}
          currentGender={genderFilter}
          currentStatus={statusFilter}
        />
      </div>
    </RoleGuard>
  )
}