"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Activity, Calendar, User, ExternalLink, Stethoscope } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/auth/role-guard"

interface MedicalExam {
    id: string
    examType: string
    date: string
    results: string
    patient: {
        firstName: string
        lastName: string
    }
    doctor: {
        username: string
    }
}

export default function MedicalExamsPage() {
    const [medicalExams, setMedicalExams] = useState<MedicalExam[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const router = useRouter()

    useEffect(() => {
        fetchMedicalExams()
    }, [])

    const fetchMedicalExams = async () => {
        try {
            const response = await fetch("/api/medical-exams")
            if (response.ok) {
                const data = await response.json()
                setMedicalExams(data)
            } else {
                console.error("Failed to fetch medical exams:", response.statusText)
            }
        } catch (error) {
            console.error("Error fetching medical exams:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredExams = medicalExams.filter((exam) =>
        `${exam.patient.firstName} ${exam.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.examType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.results.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-3xl font-bold text-foreground">Examens Médicaux</h1>
                    <p className="text-muted-foreground">Registre numérique des examens et analyses médicales</p>
                </div>
                <RoleGuard permission="exam.write">
                    <Link href="/dashboard/medical-exams/new">
                        <Button>
                            <Stethoscope className="mr-2 h-4 w-4" />
                            Nouvel Examen
                        </Button>
                    </Link>
                </RoleGuard>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Rechercher par patient, type d'examen ou résultats..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4">
                {filteredExams.map((exam) => (
                    <Card key={exam.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-primary" />
                                        <h3 className="font-semibold">{exam.examType}</h3>
                                        <Badge variant="secondary">
                                            {exam.patient.firstName} {exam.patient.lastName}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Réalisé le {new Date(exam.date).toLocaleDateString("fr-FR")}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span>Docteur: {exam.doctor.username}</span>
                                        </div>

                                        <div className="md:col-span-2">
                                            <p className="line-clamp-2 italic">
                                                Résultats: {exam.results}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(`/dashboard/medical-exams/${exam.id}`)}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Détails
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredExams.length === 0 && (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {searchTerm ? "Aucun examen trouvé" : "Aucun examen enregistré"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {searchTerm ? "Aucun résultat pour votre recherche." : "Commencez par enregistrer un nouvel examen médical."}
                        </p>
                        <RoleGuard permission="exam.write">
                            <Button asChild>
                                <Link href="/dashboard/medical-exams/new">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Créer un Examen
                                </Link>
                            </Button>
                        </RoleGuard>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
