"use client"

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, Pencil, Eye, Filter } from "lucide-react"
import Link from "next/link"

// Composants shadcn/ui
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"


// Définition d'un type Citoyen simplifié (à adapter si nécessaire)
interface Citizen {
    id: string
    firstName: string
    lastName: string
    nationalityID: string
    gender: 'MALE' | 'FEMALE' | 'OTHER' | string
    maritalStatus: 'SINGLE' | 'MARRIED' | 'COHABITATION' | 'DIVORCED' | 'WIDOWED' | string
    nationality: 'CONGOLAISE_RDC' | 'FOREIGN' | string
    birthDate: Date
}

interface CitizensTableWrapperProps {
    initialCitizens: Citizen[]
    totalPages: number
    currentPage: number
    currentSearchTerm: string
    currentGender: string
    currentStatus: string
}

const getGenderLabel = (gender: string) => {
    switch (gender) {
        case "MALE": return "Homme"
        case "FEMALE": return "Femme"
        case "OTHER": return "Autre"
        default: return gender
    }
}

const getMaritalStatusLabel = (status: string) => {
    switch (status) {
        case "SINGLE": return "Célibataire"
        case "MARRIED": case "COHABITATION": return "Marié(e)"
        case "DIVORCED": return "Divorcé(e)"
        case "WIDOWED": return "Veuf/Veuve"
        default: return status
    }
}

export function CitizensTableWrapper({
    initialCitizens,
    totalPages,
    currentPage,
    currentSearchTerm,
    currentGender,
    currentStatus
}: CitizensTableWrapperProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(currentSearchTerm)
    const [genderFilter, setGenderFilter] = useState(currentGender || 'ALL')
    const [statusFilter, setStatusFilter] = useState(currentStatus || 'ALL')
    const [isPending, startTransition] = useTransition()

    const applyFilters = (search: string, gender: string, status: string, page: number = 1) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (search) params.set('search', search)
            else params.delete('search')

            if (gender && gender !== 'ALL') params.set('gender', gender)
            else params.delete('gender')

            if (status && status !== 'ALL') params.set('status', status)
            else params.delete('status')

            params.set('page', page.toString())
            router.push(`${pathname}?${params.toString()}`)
        })
    }

    const handleSearchClick = () => {
        applyFilters(searchTerm, genderFilter, statusFilter)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearchClick()
    }

    const handlePageChange = (page: number) => {
        applyFilters(searchTerm, genderFilter, statusFilter, page)
    }

    useEffect(() => {
        setSearchTerm(currentSearchTerm)
        setGenderFilter(currentGender || 'ALL')
        setStatusFilter(currentStatus || 'ALL')
    }, [currentSearchTerm, currentGender, currentStatus])

    // Define columns for DataTable
    const columns: ColumnDef<Citizen>[] = [
        {
            header: "Nom Complet",
            accessorKey: "firstName",
            cell: ({ row }) => {
                const citizen = row.original
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground/90">{citizen.firstName} {citizen.lastName}</span>
                        <span className="text-xs text-muted-foreground">
                            Né(e) le {new Date(citizen.birthDate).toLocaleDateString("fr-FR")}
                        </span>
                    </div>
                )
            }
        },
        {
            header: "ID National",
            accessorKey: "nationalityID",
            cell: ({ row }) => (
                <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground border-border/60 bg-muted/20">
                    {row.original.nationalityID}
                </Badge>
            )
        },
        {
            header: "Genre",
            accessorKey: "gender",
            cell: ({ row }) => (
                <span className="text-sm font-medium">{getGenderLabel(row.original.gender)}</span>
            )
        },
        {
            header: "Statut Marital",
            accessorKey: "maritalStatus",
            cell: ({ row }) => (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                    {getMaritalStatusLabel(row.original.maritalStatus)}
                </span>
            )
        },
        {
            header: "Nationalité",
            accessorKey: "nationality",
            cell: ({ row }) => {
                const citizen = row.original
                return (
                    <Badge
                        variant={citizen.nationality === "CONGOLAISE" || citizen.nationality === "CONGOLAISE_RDC" ? "default" : "secondary"}
                        className="text-[10px] shadow-none"
                    >
                        {citizen.nationality === "CONGOLAISE" || citizen.nationality === "CONGOLAISE_RDC" ? "RDC" : "Étranger"}
                    </Badge>
                )
            }
        },
        {
            header: "Actions",
            id: "actions",
            cell: ({ row }) => {
                const citizen = row.original
                return (
                    <div className="flex justify-end gap-1">
                        <Link href={`/dashboard/citizens/${citizen.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-full" title="Modifier">
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                        <Link href={`/dashboard/citizens/${citizen.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all rounded-full" title="Voir détails">
                                <Eye className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>
                )
            }
        }
    ]

    return (
        <div className="space-y-6">
            <Card className="border-border/50 shadow-sm bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Filter className="h-5 w-5 text-primary" />
                                Recherche & Filtres
                            </CardTitle>
                            <CardDescription>Affinez la liste des citoyens</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Input
                                placeholder="Rechercher par nom, prénom, ou ID national..."
                                className="pl-9 bg-background/50 border-border/60 focus:border-primary/50 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        <Select value={genderFilter} onValueChange={(value) => setGenderFilter(value)}>
                            <SelectTrigger className="w-full md:w-[150px] bg-background/50 border-border/60">
                                <SelectValue placeholder="Genre" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tout Genre</SelectItem>
                                <SelectItem value="MALE">Homme</SelectItem>
                                <SelectItem value="FEMALE">Femme</SelectItem>
                                <SelectItem value="OTHER">Autre</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                            <SelectTrigger className="w-full md:w-[150px] bg-background/50 border-border/60">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tout Statut</SelectItem>
                                <SelectItem value="SINGLE">Célibataire</SelectItem>
                                <SelectItem value="MARRIED">Marié(e)</SelectItem>
                                <SelectItem value="DIVORCED">Divorcé(e)</SelectItem>
                                <SelectItem value="WIDOWED">Veuf/Veuve</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={handleSearchClick} disabled={isPending} className="md:w-auto shadow-sm">
                            {isPending ? 'Recherche...' : 'Appliquer'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <DataTable
                columns={columns}
                data={initialCitizens}
                isLoading={isPending}
                pagination={{
                    currentPage,
                    totalPages,
                    onPageChange: handlePageChange
                }}
                emptyMessage="Aucun citoyen trouvé."
            />
        </div>
    )
}