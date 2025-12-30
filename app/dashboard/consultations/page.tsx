"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, Calendar, User, FileText, Eye, Stethoscope } from "lucide-react"
import { RoleGuard } from "@/components/auth/role-guard"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"


interface Consultation {
  id: string
  date: string
  diagnosis: string
  notes?: string
  price: number
  duration: string
  doctor: {
    username: string
  }
  patient: {
    firstName: string
    lastName: string
    nationalityID: string
  }
  prescriptions: {
    medications: any[]
  }[]
}

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      const response = await fetch("/api/consultations")
      if (response.ok) {
        const data = await response.json()
        setConsultations(data)
      }
    } catch (error) {
      console.error("Error fetching consultations:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConsultations = consultations.filter((consultation) =>
    consultation.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.doctor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredConsultations.length / ITEMS_PER_PAGE)
  const paginatedConsultations = filteredConsultations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const columns: ColumnDef<Consultation>[] = [
    {
      header: "Patient",
      cell: ({ row }) => {
        const record = row.original
        return (
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {record.patient.firstName} {record.patient.lastName}
            </span>
            <span className="text-xs text-muted-foreground">ID: {record.patient.nationalityID}</span>
          </div>
        )
      }
    },
    {
      header: "Médecin",
      cell: ({ row }) => {
        const record = row.original
        return (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Stethoscope className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-medium">Dr. {record.doctor.username}</span>
          </div>
        )
      }
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(row.getValue("date")).toLocaleDateString("fr-FR")}
        </div>
      )
    },
    {
      header: "Diagnostic",
      accessorKey: "diagnosis",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue("diagnosis")}>
          <span className="font-medium text-slate-700 dark:text-slate-300">{row.getValue("diagnosis")}</span>
        </div>
      )
    },
    {
      header: "Prescriptions",
      cell: ({ row }) => {
        const medCount = row.original.prescriptions.reduce((acc, p) => acc + p.medications.length, 0)
        return medCount > 0 ? (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            {medCount} médicament(s)
          </Badge>
        ) : <span className="text-xs text-muted-foreground">—</span>
      }
    },
    {
      header: "Prix",
      accessorKey: "price",
      // className: "text-right", // TanStack table column def doesn't directly support className in this way, handled via meta or cell rendering if needed, but flexRender helps.
      // However, we can use cell styling.
      cell: ({ row }) => <div className="text-right font-bold text-slate-900 dark:text-white">{(row.getValue("price") as number).toFixed(2)} $</div>
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Link href={`/dashboard/consultations/${row.original.id}`}>
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
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Consultations</h1>
          <p className="text-slate-500 font-medium">Suivi médical et historique des patients</p>
        </div>
        <RoleGuard permission="consultations.write">
          <Link href="/dashboard/consultations/new">
            <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Consultation
            </Button>
          </Link>
        </RoleGuard>
      </div>

      <Card className="border-border/50 shadow-sm bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Filter className="h-5 w-5 text-emerald-600" />
                Recherche
              </CardTitle>
              <CardDescription>Filtrer par patient, médecin ou diagnostic</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative group max-w-md">
            <Search className="absolute left-3 top-2.5 transform text-muted-foreground h-4 w-4 group-hover:text-emerald-600 transition-colors" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 bg-background/50 border-border/60 focus:border-emerald-500/50 transition-all"
            />
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={paginatedConsultations}
        isLoading={loading}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage
        }}
        emptyMessage="Aucune consultation trouvée."
      />
    </div>
  )
}
