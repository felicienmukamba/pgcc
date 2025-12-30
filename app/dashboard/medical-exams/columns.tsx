"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Activity, User } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type MedicalExam = {
    id: string
    examType: string
    date: Date
    results: string
    patient: {
        firstName: string
        lastName: string
        nationalityID: string
    }
    doctor: {
        username: string
    }
}

export const columns: ColumnDef<MedicalExam>[] = [
    {
        accessorKey: "date",
        header: "Date de l'Examen",
        cell: ({ row }) => {
            return new Date(row.getValue("date")).toLocaleDateString("fr-FR", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        },
    },
    {
        accessorKey: "examType",
        header: "Type d'Examen",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{row.getValue("examType")}</span>
            </div>
        )
    },
    {
        accessorKey: "patient",
        header: "Patient",
        cell: ({ row }) => {
            const patient = row.original.patient
            return (
                <div className="flex flex-col">
                    <span className="font-semibold text-base">{patient.firstName} {patient.lastName}</span>
                    <span className="text-xs text-muted-foreground">{patient.nationalityID}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "doctor",
        header: "Médecin",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Dr. {row.original.doctor.username}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "results",
        header: "Résultats (Aperçu)",
        cell: ({ row }) => {
            const results = row.getValue("results") as string
            return (
                <span className="text-sm text-muted-foreground line-clamp-1 italic max-w-[200px]">
                    {results}
                </span>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const exam = row.original

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
                        <Link href={`/dashboard/medical-exams/${exam.id}`}>
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
