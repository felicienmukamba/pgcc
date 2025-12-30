"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, Calendar, User, Shield, AlertTriangle, Eye, Gavel } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

interface Complaint {
  id: string
  date: string
  type: string
  status: string
  place: string
  description: string
  plaintiff: {
    firstName: string
    lastName: string
  }
  accused?: {
    firstName: string
    lastName: string
  }
  policeOfficer: {
    username: string
  }
  witnesses?: boolean
  evidence?: boolean
}

export default function ComplaintsPage() {
  const { data: session } = useSession()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const canCreateComplaint = session?.user?.roles?.some((role) => ["ADMIN", "OPJ", "CITOYEN"].includes(role))

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await fetch("/api/complaints")
      if (response.ok) {
        const data = await response.json()
        setComplaints(data)
      }
    } catch (error) {
      console.error("Error fetching complaints:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "RESOLVED":
        return "bg-green-100 text-green-800 border-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "En attente"
      case "IN_PROGRESS": return "En cours"
      case "RESOLVED": return "Résolue"
      case "REJECTED": return "Rejetée"
      default: return status
    }
  }

  const getPriorityIcon = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes("violence") || lowerType.includes("agression")) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    return <Shield className="h-4 w-4 text-orange-500" />
  }

  const filteredComplaints = complaints.filter((complaint) =>
    complaint.plaintiff?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.plaintiff?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.accused?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.accused?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE)
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const columns: ColumnDef<Complaint>[] = [
    {
      header: "Type",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getPriorityIcon(row.original.type)}
          <span className="font-semibold text-sm">{row.original.type}</span>
        </div>
      )
    },
    {
      header: "Plaignant",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {row.original.plaintiff.firstName} {row.original.plaintiff.lastName}
          </span>
        </div>
      )
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(row.original.date).toLocaleDateString("fr-FR")}
        </div>
      )
    },
    {
      header: "Statut",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge variant="outline" className={`${getStatusColor(row.original.status)} font-medium border`}>
          {getStatusLabel(row.original.status)}
        </Badge>
      )
    },
    {
      header: "OPJ en charge",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Shield className="h-3.5 w-3.5 text-slate-400" />
          {row.original.policeOfficer.username}
        </div>
      )
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Link href={`/dashboard/complaints/${row.original.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50 text-muted-foreground hover:text-orange-600 rounded-full">
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
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Plaintes</h1>
          <p className="text-slate-500 font-medium">Gestion des plaintes et mains courantes</p>
        </div>
        {canCreateComplaint && (
          <Link href="/dashboard/complaints/new">
            <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Plainte
            </Button>
          </Link>
        )}
      </div>

      <Card className="border-border/50 shadow-sm bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Filter className="h-5 w-5 text-orange-600" />
                Recherche
              </CardTitle>
              <CardDescription>Trouver une plainte par nom ou type</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative group max-w-md">
            <Search className="absolute left-3 top-2.5 transform text-muted-foreground h-4 w-4 group-hover:text-orange-600 transition-colors" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 bg-background/50 border-border/60 focus:border-orange-500/50 transition-all"
            />
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={paginatedComplaints}
        isLoading={loading}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage
        }}
        emptyMessage="Aucune plainte trouvée."
      />
    </div>
  )
}
