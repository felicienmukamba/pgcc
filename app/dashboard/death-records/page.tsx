"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Skull, Calendar, MapPin, User, UserPlus, Filter, Eye } from "lucide-react"
import Link from "next/link"
import { RoleGuard } from "@/components/auth/role-guard"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"

interface DeathRecord {
  id: string
  deathPlace: string
  deathDate: string
  informantRelationship: string
  funeralPlace?: string
  cemeteryName?: string
  citizen: {
    firstName: string
    lastName: string
  }
  declarer: {
    username: string
  }
  officiant: {
    username: string
  }
}

export default function DeathRecordsPage() {
  const [deathRecords, setDeathRecords] = useState<DeathRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    fetchDeathRecords()
  }, [])

  const fetchDeathRecords = async () => {
    try {
      const response = await fetch("/api/death-records")
      if (response.ok) {
        const data = await response.json()
        setDeathRecords(data)
      }
    } catch (error) {
      console.error("Error fetching death records:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = deathRecords.filter(
    (record) =>
      record.citizen.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.citizen.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.deathPlace.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const columns: ColumnDef<DeathRecord>[] = [
    {
      header: "Défunt",
      cell: ({ row }) => {
        const record = row.original
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 dark:text-slate-100">{record.citizen.firstName} {record.citizen.lastName}</span>
            </div>
          </div>
        )
      }
    },
    {
      header: "Date de Décès",
      accessorKey: "deathDate",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(row.original.deathDate).toLocaleDateString("fr-FR")}
        </div>
      )
    },
    {
      header: "Lieu",
      accessorKey: "deathPlace",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          {row.original.deathPlace}
        </div>
      )
    },
    {
      header: "Déclarant",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.original.declarer.username}</span>
          <span className="text-xs text-muted-foreground">{row.original.informantRelationship}</span>
        </div>
      )
    },
    {
      header: "Inhumation",
      cell: ({ row }) => row.original.cemeteryName ? (
        <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-700 font-medium">
          {row.original.cemeteryName}
        </span>
      ) : <span className="text-xs text-muted-foreground italic">—</span>
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 text-muted-foreground hover:text-slate-900 rounded-full">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Actes de Décès</h1>
          <p className="text-slate-500 font-medium">Gestion des actes de décès et enregistrements mortuaires</p>
        </div>
        <RoleGuard permission="death.write">
          <Link href="/dashboard/death-records/new">
            <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-slate-800 hover:bg-slate-900 text-white">
              <UserPlus className="mr-2 h-4 w-4" />
              Déclarer un décès
            </Button>
          </Link>
        </RoleGuard>
      </div>

      <Card className="border-border/50 shadow-sm bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Filter className="h-5 w-5 text-slate-600" />
                Recherche
              </CardTitle>
              <CardDescription>Trouver un acte par nom ou lieu</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative group max-w-md">
            <Search className="absolute left-3 top-2.5 transform text-muted-foreground h-4 w-4 group-hover:text-slate-900 transition-colors" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 bg-background/50 border-border/60 focus:border-slate-500/50 transition-all"
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
        emptyMessage="Aucun acte de décès trouvé."
      />
    </div>
  )
}
