"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FileText, Calendar, MapPin, ExternalLink, UserPlus, Filter, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/auth/role-guard"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"


interface BirthRecord {
  id: string
  registrationNumber: string
  childName: string
  gender: string
  birthDate: string
  birthPlace: string
  date: string
  citizen: {
    firstName: string
    lastName: string
  }
  officiant: {
    username: string
  }
}

export default function BirthRecordsPage() {
  const [birthRecords, setBirthRecords] = useState<BirthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const router = useRouter()

  useEffect(() => {
    fetchBirthRecords()
  }, [])

  const fetchBirthRecords = async () => {
    try {
      const response = await fetch("/api/birth-records")
      if (response.ok) {
        const data = await response.json()
        // Sort by date desc by default if not already
        setBirthRecords(data)
      } else {
        console.error("Failed to fetch birth records:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching birth records:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = birthRecords.filter((record) =>
    (record.childName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.registrationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.birthPlace || '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Client-side pagination logic since the API seems to return all
  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const columns: ColumnDef<BirthRecord>[] = [
    {
      header: "Enfant",
      accessorKey: "childName",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.original.childName}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Né(e) le {new Date(row.original.birthDate).toLocaleDateString("fr-FR")}
          </span>
        </div>
      )
    },
    {
      header: "Numéro",
      accessorKey: "registrationNumber",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-[10px] bg-muted/30">
          {row.getValue("registrationNumber")}
        </Badge>
      )
    },
    {
      header: "Lieu",
      accessorKey: "birthPlace",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          {row.getValue("birthPlace")}
        </div>
      )
    },
    {
      header: "Genre",
      accessorKey: "gender",
      cell: ({ row }) => <Badge variant={row.original.gender === 'MALE' ? 'secondary' : 'default'} className="text-[10px]">{row.original.gender}</Badge>
    },
    {
      header: "Parents",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.citizen?.firstName} {row.original.citizen?.lastName}
        </span>
      )
    },
    {
      header: "Date Enreg.",
      accessorKey: "date",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{new Date(row.getValue("date")).toLocaleDateString("fr-FR")}</span>
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Link href={`/dashboard/birth-records/${row.original.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 text-muted-foreground hover:text-blue-600 rounded-full">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Actes de Naissance</h1>
          <p className="text-slate-500 font-medium">Gestion des registres d'état civil</p>
        </div>
        <RoleGuard permission="birth.write">
          <Link href="/dashboard/birth-records/new">
            <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              <UserPlus className="mr-2 h-4 w-4" />
              Nouvel Enregistrement
            </Button>
          </Link>
        </RoleGuard>
      </div>

      <Card className="border-border/50 shadow-sm bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Recherche
              </CardTitle>
              <CardDescription>Trouver un acte par nom ou numéro</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative group max-w-md">
            <Search className="absolute left-3 top-2.5 transform text-muted-foreground h-4 w-4 group-hover:text-primary transition-colors" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} // Reset page on search
              className="pl-9 bg-background/50 border-border/60 focus:border-primary/50"
            />
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={paginatedRecords}
        isLoading={loading}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage
        }}
        emptyMessage="Aucun acte de naissance trouvé."
      />
    </div>
  )
}