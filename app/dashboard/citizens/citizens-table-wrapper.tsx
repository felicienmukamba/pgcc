"use client"

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { UserPlus, Search, Pencil, Eye } from "lucide-react"
import Link from "next/link"

// Composants shadcn/ui
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, ColumnDef } from "@/components/ui/data-table"

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
            cell: (citizen) => (
                <div>
                    <span className="font-medium text-slate-900">{citizen.firstName} {citizen.lastName}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Né(e) le {new Date(citizen.birthDate).toLocaleDateString("fr-FR")}
                    </p>
                </div>
            )
        },
        {
            header: "ID National",
            accessorKey: "nationalityID",
            cell: (citizen) => <span className="font-mono text-xs">{citizen.nationalityID}</span>
        },
        {
            header: "Genre",
            accessorKey: "gender",
            cell: (citizen) => getGenderLabel(citizen.gender)
        },
        {
            header: "Statut Marital",
            accessorKey: "maritalStatus",
            cell: (citizen) => <Badge variant="outline" className="text-[10px]">{getMaritalStatusLabel(citizen.maritalStatus)}</Badge>
        },
        {
            header: "Nationalité",
            accessorKey: "nationality",
            cell: (citizen) => (
                <Badge variant={citizen.nationality === "CONGOLAISE" || citizen.nationality === "CONGOLAISE_RDC" ? "default" : "secondary"} className="text-[10px]">
                    {citizen.nationality === "CONGOLAISE" || citizen.nationality === "CONGOLAISE_RDC" ? "National" : "Étranger"}
                </Badge>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (citizen) => (
                <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/citizens/${citizen.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Modifier">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href={`/dashboard/citizens/${citizen.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100" title="Voir détails">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <CardTitle className="text-base font-bold uppercase tracking-tight text-slate-800">Recherche & Filtres</CardTitle>
                    <CardDescription>Critères de sélection des dossiers citoyens</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Rechercher par nom, prénom, ou ID national..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        <Select value={genderFilter} onValueChange={(value) => setGenderFilter(value)}>
                            <SelectTrigger className="w-full md:w-[150px]">
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
                            <SelectTrigger className="w-full md:w-[150px]">
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

                        <Button onClick={handleSearchClick} disabled={isPending} className="md:w-auto">
                            {isPending ? '...' : <Search className="h-4 w-4" />}
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