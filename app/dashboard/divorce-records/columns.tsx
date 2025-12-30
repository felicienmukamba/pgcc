"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, FileText } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type DivorceRecord = {
    id: string
    registrationNumber: string
    partner1: {
        firstName: string
        lastName: string
    }
    partner2: {
        firstName: string
        lastName: string
    }
    divorceDate: string
    divorcePlace: string
    officiant: {
        username: string
    }
}

export const columns: ColumnDef<DivorceRecord>[] = [
    {
        accessorKey: "registrationNumber",
        header: "N° Enregistrement",
        cell: ({ row }) => (
            <span className="font-mono">{row.getValue("registrationNumber")}</span>
        )
    },
    {
        accessorKey: "partner1",
        header: "Ex-Conjoints",
        cell: ({ row }) => {
            const p1 = row.original.partner1
            const p2 = row.original.partner2
            return (
                <div className="flex flex-col">
                    <span className="font-medium text-base">{p1.firstName} {p1.lastName}</span>
                    <span className="text-xs text-muted-foreground">&</span>
                    <span className="font-medium text-base">{p2.firstName} {p2.lastName}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "divorceDate",
        header: "Date de Divorce",
        cell: ({ row }) => {
            return new Date(row.getValue("divorceDate")).toLocaleDateString("fr-FR", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        },
    },
    {
        accessorKey: "divorcePlace",
        header: "Lieu",
    },
    {
        accessorKey: "officiant",
        header: "Officiant",
        cell: ({ row }) => row.original.officiant.username
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const record = row.original

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
                        <Link href={`/dashboard/divorce-records/${record.id}`}>
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
