"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Shield, Gavel, FileText } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Conviction = {
    id: string
    date: Date
    court: string
    offenseNature: string
    sentenceType: string
    status: string
    appealStatus: string
    sentence: string
    citizen: {
        firstName: string
        lastName: string
        nationalityID: string
    }
    prosecutor: {
        username: string
    }
}

export const columns: ColumnDef<Conviction>[] = [
    {
        accessorKey: "citizen",
        header: "Citoyen Concerné",
        cell: ({ row }) => {
            const citizen = row.original.citizen
            return (
                <div className="flex flex-col">
                    <span className="font-semibold text-base">{citizen.firstName} {citizen.lastName}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Shield className="h-3 w-3" /> {citizen.nationalityID}
                    </span>
                </div>
            )
        }
    },
    {
        accessorKey: "offenseNature",
        header: "Nature de l'Infraction",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Gavel className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{row.getValue("offenseNature")}</span>
            </div>
        )
    },
    {
        accessorKey: "sentenceType",
        header: "Type de Peine",
        cell: ({ row }) => {
            const type = row.getValue("sentenceType") as string
            let colorClass = "bg-slate-100 text-slate-800"
            let label = type

            switch (type) {
                case "IMPRISONMENT":
                    colorClass = "bg-red-100 text-red-800 border-red-200"
                    label = "Emprisonnement"
                    break
                case "FINE":
                    colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200"
                    label = "Amende"
                    break
                case "COMMUNITY_SERVICE":
                    colorClass = "bg-blue-100 text-blue-800 border-blue-200"
                    label = "T.I.G"
                    break
            }

            return <Badge variant="outline" className={`${colorClass}`}>{label}</Badge>
        },
    },
    {
        accessorKey: "date",
        header: "Date du Jugement",
        cell: ({ row }) => {
            return new Date(row.getValue("date")).toLocaleDateString("fr-FR", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        },
    },
    {
        accessorKey: "court",
        header: "Tribunal",
    },
    {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
                    {status}
                </Badge>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const conviction = row.original

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
                        <Link href={`/dashboard/convictions/${conviction.id}`}>
                            <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" /> Voir détails
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Copier ID</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
