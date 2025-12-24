"use client"

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from "next/link"

// Composants
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Calendar, User, Shield } from "lucide-react"

// Redéfinition du type pour l'autonomie du composant client
interface ComplaintWithRelations {
  id: string
  date: Date
  type: string
  status: string
  place: string
  description: string | null
  witnesses: boolean | null
  evidence: boolean | null
  plaintiff: {
    firstName: string
    lastName: string
  }
  accused: {
    firstName: string
    lastName: string
  } | null
  policeOfficer: {
    username: string
  }
}

interface ComplaintsFilterAndListProps {
    initialComplaints: ComplaintWithRelations[]
    initialSearchTerm: string
    initialStatusFilter: string
    canCreateComplaint: boolean
    // Fonctions de rendu passées depuis le composant serveur
    getStatusColor: (status: string) => string
    getStatusLabel: (status: string) => string
    getPriorityIcon: (type: string) => JSX.Element
}

export function ComplaintsFilterAndList({
    initialComplaints,
    initialSearchTerm,
    initialStatusFilter,
    canCreateComplaint,
    getStatusColor,
    getStatusLabel,
    getPriorityIcon
}: ComplaintsFilterAndListProps) {
    const router = useRouter()
    const pathname = usePathname()
    // Récupération de l'objet ReadonlyURLSearchParams
    const searchParams = useSearchParams() 
    
    // État local synchronisé avec les props initiales (issues de l'URL)
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
    const [statusFilter, setStatusFilter] = useState(initialStatusFilter || 'ALL')
    const [isPending, startTransition] = useTransition()

    // Resynchronisation si l'URL change (e.g., navigation)
    useEffect(() => {
        setSearchTerm(initialSearchTerm)
        setStatusFilter(initialStatusFilter || 'ALL')
    }, [initialSearchTerm, initialStatusFilter])

    // Fonction d'application des filtres et mise à jour de l'URL
    const applyFilters = (search: string, status: string) => {
        startTransition(() => {
            // CORRECTION CRITIQUE: Utiliser .toString() pour convertir ReadonlyURLSearchParams
            // en chaîne de requête, permettant la création d'un objet mutable.
            const params = new URLSearchParams(searchParams.toString())

            // 1. Terme de recherche
            if (search.trim()) {
                params.set('search', search.trim())
            } else {
                params.delete('search')
            }

            // 2. Filtre Statut
            if (status && status !== 'ALL') {
                params.set('status', status)
            } else {
                params.delete('status')
            }

            // Navigation vers la nouvelle URL
            router.push(`${pathname}?${params.toString()}`)
        })
    }

    const handleSearchClick = () => {
        applyFilters(searchTerm, statusFilter)
    }
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchClick()
        }
    }

    const handleStatusChange = (newStatus: string) => {
        setStatusFilter(newStatus)
        // Application immédiate du filtre de statut
        applyFilters(searchTerm, newStatus) 
    }

    return (
        <>
            {/* Search and Filter Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Recherche et filtres</CardTitle>
                    <CardDescription>Trouvez rapidement une plainte par plaignant, accusé ou type.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input 
                                placeholder="Rechercher par plaignant, accusé, ou type de plainte..." 
                                className="w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isPending}
                            />
                        </div>
                        
                        {/* Status Filter Dropdown */}
                        <Select value={statusFilter} onValueChange={handleStatusChange} disabled={isPending}>
                            <SelectTrigger className="w-full md:w-[150px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tous les statuts</SelectItem>
                                <SelectItem value="PENDING">En attente</SelectItem>
                                <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                                <SelectItem value="RESOLVED">Résolue</SelectItem>
                                <SelectItem value="REJECTED">Rejetée</SelectItem>
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

            {/* Complaints List */}
            <div className="grid gap-4">
                {initialComplaints.map((complaint) => (
                    <Card key={complaint.id} className="hover:shadow-lg transition-shadow border-l-4 border-orange-500/50">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                                            {getPriorityIcon(complaint.type)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold flex items-center gap-3">
                                                Plainte #{complaint.id.slice(-8)}
                                                <Badge className={getStatusColor(complaint.status)}>
                                                    {getStatusLabel(complaint.status)}
                                                </Badge>
                                            </h3>
                                            <p className="text-sm text-muted-foreground">Type: {complaint.type}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mt-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className='font-medium'>Date:</span>
                                            <span>{new Date(complaint.date).toLocaleDateString("fr-FR")}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className='font-medium'>Plaignant:</span>
                                            <span>{complaint.plaintiff.firstName} {complaint.plaintiff.lastName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            <span className='font-medium'>OPJ:</span>
                                            <span>{complaint.policeOfficer.username}</span>
                                        </div>
                                    </div>

                                    {complaint.accused && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground font-medium">Accusé:</span>{" "}
                                            <span className="font-semibold">
                                                {complaint.accused.firstName} {complaint.accused.lastName}
                                            </span>
                                        </div>
                                    )}

                                    <div className="space-y-2 pt-2">
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Lieu:</span>
                                            <p className="text-sm mt-1">{complaint.place}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-muted-foreground">Description:</span>
                                            <p className="text-sm mt-1 line-clamp-2 italic text-gray-700 dark:text-gray-300">
                                                {complaint.description}
                                            </p>
                                        </div>
                                    </div>

                                    {(complaint.witnesses || complaint.evidence) && (
                                        <div className="flex gap-4 text-sm mt-2">
                                            {complaint.witnesses && (
                                                <Badge variant="secondary">Témoins fournis</Badge>
                                            )}
                                            {complaint.evidence && (
                                                <Badge variant="secondary">Preuves fournies</Badge>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="text-right space-y-2 flex-shrink-0">
                                    <Link href={`/dashboard/complaints/${complaint.id}`}>
                                        <Button variant="outline" size="sm">
                                            Voir détails
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {initialComplaints.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Aucune plainte trouvée</h3>
                        <p className="text-muted-foreground mb-4">
                            {(initialSearchTerm || initialStatusFilter !== 'ALL')
                                ? "Aucun résultat ne correspond à vos critères de recherche/filtre."
                                : "Aucune plainte n'a été enregistrée dans le système."}
                        </p>
                        {canCreateComplaint && (
                            <Link href="/dashboard/complaints/new">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nouvelle plainte
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}
        </>
    )
}
