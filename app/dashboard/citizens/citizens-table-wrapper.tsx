"use client"

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { UserPlus, Search, Pencil, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

// Composants shadcn/ui
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

// --- Helper Functions ---

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

// --- Pagination Component ---
function Pagination({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const createPageURL = (pageNumber: number | string) => {
        // CORRECTION: Utiliser .toString() pour créer un objet URLSearchParams mutable
        const params = new URLSearchParams(searchParams.toString()) 
        params.set('page', pageNumber.toString())
        return `${pathname}?${params.toString()}`
    }

    const goToPage = (page: number) => {
        if (page > 0 && page <= totalPages) {
            router.push(createPageURL(page))
        }
    }

    return (
        <div className="flex justify-end items-center space-x-2 p-4 border-t">
            <span className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
            </span>
            <Button 
                variant="outline" 
                size="icon" 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
                variant="outline" 
                size="icon" 
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}

// --- Main Client Component ---
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

    // Fonction pour appliquer la recherche/filtre et mettre à jour l'URL
    const applyFilters = (search: string, gender: string, status: string) => {
        startTransition(() => {
            // CORRECTION: Utiliser .toString() pour créer un objet URLSearchParams mutable
            const params = new URLSearchParams(searchParams.toString()) 
            
            // 1. Terme de recherche
            if (search) {
                params.set('search', search)
            } else {
                params.delete('search')
            }

            // 2. Filtre Genre
            if (gender && gender !== 'ALL') {
                params.set('gender', gender)
            } else {
                params.delete('gender')
            }

            // 3. Filtre Statut
            if (status && status !== 'ALL') {
                params.set('status', status)
            } else {
                params.delete('status')
            }

            // Réinitialiser la page à 1 après chaque nouvelle recherche/filtre
            params.set('page', '1')

            router.push(`${pathname}?${params.toString()}`)
        })
    }

    const handleSearchClick = () => {
        applyFilters(searchTerm, genderFilter, statusFilter)
    }
    
    // Permettre la recherche avec la touche Entrée
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchClick()
        }
    }

    // Mettre à jour l'état local lorsque les paramètres URL changent (navigation)
    useEffect(() => {
        setSearchTerm(currentSearchTerm)
        setGenderFilter(currentGender || 'ALL')
        setStatusFilter(currentStatus || 'ALL')
    }, [currentSearchTerm, currentGender, currentStatus])

    return (
        <>
            {/* Search and Filter Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Recherche et filtres</CardTitle>
                    <CardDescription>Trouvez rapidement un citoyen par nom, ID, ou filtrez par état.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input 
                                placeholder="Rechercher par nom, prénom, ou ID national..." 
                                className="w-full" 
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

                        <Button 
                            onClick={handleSearchClick}
                            disabled={isPending}
                        >
                            <Search className="mr-2 h-4 w-4" />
                            {isPending ? 'Recherche...' : 'Rechercher'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table Card */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Liste des citoyens 
                        {currentSearchTerm && <span> (Résultats pour "{currentSearchTerm}")</span>}
                    </CardTitle>
                    <CardDescription>
                        {isPending ? 'Chargement des données...' : 'Aperçu des citoyens enregistrés.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {initialCitizens.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom Complet</TableHead>
                                        <TableHead>ID National</TableHead>
                                        <TableHead>Genre</TableHead>
                                        <TableHead>Statut Marital</TableHead>
                                        <TableHead>Nationalité</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {initialCitizens.map((citizen) => (
                                        <TableRow key={citizen.id} className={isPending ? 'opacity-50' : ''}>
                                            <TableCell className="font-medium">
                                                {citizen.firstName} {citizen.lastName}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Né(e) le {new Date(citizen.birthDate).toLocaleDateString("fr-FR")}
                                                </p>
                                            </TableCell>
                                            <TableCell>{citizen.nationalityID}</TableCell>
                                            <TableCell>{getGenderLabel(citizen.gender)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{getMaritalStatusLabel(citizen.maritalStatus)}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={citizen.nationality === "CONGOLAISE_RDC" ? "default" : "secondary"}>
                                                    {citizen.nationality === "CONGOLAISE_RDC" ? "National" : "Étranger"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/dashboard/citizens/${citizen.id}/edit`}>
                                                        <Button variant="ghost" size="sm" title="Modifier">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/dashboard/citizens/${citizen.id}`}>
                                                        <Button variant="ghost" size="sm" title="Voir détails">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                             <h3 className="text-lg font-semibold mb-2">
                                {currentSearchTerm || currentGender !== 'ALL' || currentStatus !== 'ALL' 
                                    ? "Aucun citoyen trouvé avec les critères spécifiés." 
                                    : "Aucun citoyen enregistré"}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {currentSearchTerm ? "Veuillez essayer une recherche différente." : "Commencez par enregistrer un citoyen."}
                            </p>
                            {!currentSearchTerm && !currentGender && !currentStatus && (
                                <Link href="/dashboard/citizens/new">
                                    <Button><UserPlus className="mr-2 h-4 w-4" /> Nouveau citoyen</Button>
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && <Pagination totalPages={totalPages} currentPage={currentPage} />}
                </CardContent>
            </Card>
        </>
    )
}