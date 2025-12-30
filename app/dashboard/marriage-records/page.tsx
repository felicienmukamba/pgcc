"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, HeartHandshake, Calendar, MapPin, Users, UserPlus, Filter, Eye } from "lucide-react"
import Link from "next/link"
import { RoleGuard } from "@/components/auth/role-guard"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"


interface MarriageRecord {
  id: string
  marriagePlace: string
  marriageDate: string
  marriageType: string
  contractType?: string
  partner1: {
    firstName: string
    lastName: string
  }
  partner2: {
    firstName: string
    lastName: string
  }
  officiant: {
    username: string
  }
}

export default function MarriageRecordsPage() {
  const [marriageRecords, setMarriageRecords] = useState<MarriageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    fetchMarriageRecords()
  }, [])

  const fetchMarriageRecords = async () => {
    try {
      const response = await fetch("/api/marriage-records")
      if (response.ok) {
        const data = await response.json()
        setMarriageRecords(data)
      }
    } catch (error) {
      console.error("Error fetching marriage records:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = marriageRecords.filter(
    (record) =>
      record.partner1.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.partner1.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.partner2.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.partner2.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.marriagePlace.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const columns: ColumnDef<MarriageRecord>[] = [
    {
      header: "Époux",
      cell: ({ row }) => {
        const record = row.original
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <HeartHandshake className="h-3.5 w-3.5 text-pink-500" />
              {record.partner1.lastName} & {record.partner2.lastName}
            </span>
            <span className="text-xs text-muted-foreground">
              {record.partner1.firstName} et {record.partner2.firstName}
            </span>
          </div>
        )
      }
    },
    {
      header: "Type",
      accessorKey: "marriageType",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] border-pink-200 text-pink-700 bg-pink-50">
          {row.getValue("marriageType")}
        </Badge>
      )
    },
    {
      header: "Date",
      accessorKey: "marriageDate",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(row.getValue("marriageDate")).toLocaleDateString("fr-FR")}
        </div>
      )
    },
    {
      header: "Lieu",
      accessorKey: "marriagePlace",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          {row.getValue("marriagePlace")}
        </div>
      )
    },
    {
      header: "Régime",
      accessorKey: "contractType",
      cell: ({ row }) => {
        const type = row.original.contractType
        return type ? <span className="text-xs font-medium">{type}</span> : <span className="text-xs text-muted-foreground italic">—</span>
      }
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Link href={`/dashboard/marriage-records/${row.original.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-pink-50 text-muted-foreground hover:text-pink-600 rounded-full">
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
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Actes de Mariage</h1>
          <p className="text-slate-500 font-medium">Gestion des actes de mariage et unions civiles</p>
        </div>
        <RoleGuard permission="marriage.write">
          <Link href="/dashboard/marriage-records/new">
            <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-pink-600 hover:bg-pink-700 text-white">
              <UserPlus className="mr-2 h-4 w-4" />
              Nouvel Acte
            </Button>
          </Link>
        </RoleGuard>
      </div>

      <Card className="border-border/50 shadow-sm bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Filter className="h-5 w-5 text-pink-500" />
                Recherche
              </CardTitle>
              <CardDescription>Trouver un mariage par noms ou lieu</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative group max-w-md">
            <Search className="absolute left-3 top-2.5 transform text-muted-foreground h-4 w-4 group-hover:text-pink-500 transition-colors" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 bg-background/50 border-border/60 focus:border-pink-500/50 transition-all"
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
        emptyMessage="Aucun acte de mariage trouvé."
      />
    </div>
  )
}