"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FileText, Calendar, MapPin, ExternalLink, UserMinus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/auth/role-guard"

interface DivorceRecord {
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

export default function DivorceRecordsPage() {
    const [divorceRecords, setDivorceRecords] = useState<DivorceRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const router = useRouter()

    useEffect(() => {
        fetchDivorceRecords()
    }, [])

    const fetchDivorceRecords = async () => {
        try {
            const response = await fetch("/api/divorce-records")
            if (response.ok) {
                const data = await response.json()
                setDivorceRecords(data)
            } else {
                console.error("Failed to fetch divorce records:", response.statusText)
            }
        } catch (error) {
            console.error("Error fetching divorce records:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredRecords = divorceRecords.filter((record) =>
        `${record.partner1.firstName} ${record.partner1.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${record.partner2.firstName} ${record.partner2.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.divorcePlace.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Actes de Divorce</h1>
                    <p className="text-muted-foreground">Gestion des actes de divorce et dissolutions de mariage</p>
                </div>
                <RoleGuard permission="divorce.write">
                    <Link href="/dashboard/divorce-records/new">
                        <Button variant="destructive">
                            <UserMinus className="mr-2 h-4 w-4" />
                            Nouvel Acte de Divorce
                        </Button>
                    </Link>
                </RoleGuard>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Rechercher par nom de partenaire, numéro d'enregistrement ou lieu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4">
                {filteredRecords.map((record) => (
                    <Card key={record.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-destructive" />
                                        <h3 className="font-semibold">
                                            {record.partner1.firstName} {record.partner1.lastName} & {record.partner2.firstName} {record.partner2.lastName}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">N° Enregistrement:</span>
                                            <span>{record.registrationNumber}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Divorcé(s) le {new Date(record.divorceDate).toLocaleDateString("fr-FR")}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>à {record.divorcePlace}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Officiant:</span>
                                            <span>{record.officiant.username}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(`/dashboard/divorce-records/${record.id}`)}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Voir détails
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredRecords.length === 0 && (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {searchTerm ? "Aucun acte de divorce trouvé" : "Aucun acte de divorce enregistré"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm ? "Aucun résultat pour votre recherche." : "Commencez par enregistrer un nouvel acte de divorce."}
                        </p>
                        <RoleGuard permission="divorce.write">
                            <Button asChild variant="destructive">
                                <Link href="/dashboard/divorce-records/new">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Créer un Acte
                                </Link>
                            </Button>
                        </RoleGuard>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
