"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Pill, User } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Prescription = {
    id: string
    date: Date
    dosage: string
    duration: string
    quantity: string
    status: string
    consultation?: {
        patient: {
            firstName: string
            lastName: string
            nationalityID: string
        }
        doctor: {
            username: string
        }
    } | null
    medications: {
        id: string
        tradeName: string
        dosage?: string
        unit?: string
    }[]
}


export const columns: ColumnDef<Prescription>[] = [
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
            return new Date(row.getValue("date")).toLocaleDateString("fr-FR", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        },
    },
    {
        accessorKey: "patient",
        header: "Patient",
        cell: ({ row }) => {
            const patient = row.original.consultation?.patient
            if (!patient) return <span className="text-muted-foreground text-xs">Patient introuvable</span>
            return (
                <div className="flex flex-col">
                    <span className="font-semibold text-base">{patient.firstName} {patient.lastName}</span>
                    <span className="text-xs text-muted-foreground">{patient.nationalityID}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "medications",
        header: "Médicaments",
        cell: ({ row }) => {
            const meds = row.original.medications
            return (
                <div className="flex flex-wrap gap-1">
                    {meds.slice(0, 2).map(m => (
                        <Badge key={m.id} variant="secondary" className="text-xs">
                            {m.tradeName}
                        </Badge>
                    ))}
                    {meds.length > 2 && <Badge variant="outline" className="text-xs">+{meds.length - 2}</Badge>}
                </div>
            )
        }
    },
    {
        accessorKey: "doctor",
        header: "Médecin",
        cell: ({ row }) => {
            const doctor = row.original.consultation?.doctor
            if (!doctor) return <span className="text-muted-foreground text-xs">Médecin introuvable</span>
            return (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Dr. {doctor.username}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            let colorClass = "bg-slate-100 text-slate-800"
            let label = status

            switch (status.toLowerCase()) {
                case "active":
                    colorClass = "bg-green-100 text-green-800 border-green-200"
                    label = "Active"
                    break
                case "completed":
                    colorClass = "bg-blue-100 text-blue-800 border-blue-200"
                    label = "Terminée"
                    break
                case "cancelled":
                    colorClass = "bg-red-100 text-red-800 border-red-200"
                    label = "Annulée"
                    break
            }
            return <Badge variant="outline" className={colorClass}>{label}</Badge>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const prescription = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <Link href={`/dashboard/prescriptions/${prescription.id}`}>
                            <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" /> Voir détails
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
