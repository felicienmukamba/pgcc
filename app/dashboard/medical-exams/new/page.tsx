"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Search, Stethoscope } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface Citizen {
    id: string
    firstName: string
    lastName: string
    nationalityID: string
}

export default function NewMedicalExamPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const consultationId = searchParams.get("consultationId")
    const { data: session } = useSession()

    const [loading, setLoading] = useState(false)
    const [citizens, setCitizens] = useState<Citizen[]>([])
    const [searchPatient, setSearchPatient] = useState("")
    const [selectedPatient, setSelectedPatient] = useState<Citizen | null>(null)

    const [formData, setFormData] = useState({
        examType: "",
        results: "",
        observations: "",
        date: new Date().toISOString().split("T")[0],
    })

    useEffect(() => {
        const fetchCitizens = async () => {
            try {
                const response = await fetch("/api/citizens")
                if (response.ok) {
                    const data = await response.json()
                    setCitizens(data)
                }
            } catch (error) {
                toast({ title: "Erreur", description: "Impossible de charger les patients.", variant: "destructive" })
            }
        }
        fetchCitizens()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!selectedPatient) {
            toast({ title: "Erreur", description: "Veuillez sélectionner un patient.", variant: "destructive" })
            setLoading(false)
            return
        }

        try {
            const response = await fetch("/api/medical-exams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    patientId: selectedPatient.id,
                    consultationId: consultationId || null,
                }),
            })

            if (response.ok) {
                toast({ title: "Succès", description: "Examen médical enregistré avec succès" })
                router.push("/dashboard/medical-exams")
            } else {
                const errorData = await response.json()
                throw new Error(errorData.error || "Erreur lors de l'enregistrement")
            }
        } catch (error) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/medical-exams">
                    <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2" /> Retour</Button>
                </Link>
                <h1 className="text-2xl font-bold">Nouvel Examen Médical</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Sélection du Patient</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!selectedPatient ? (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Nom, Prénom ou ID National du patient..."
                                        value={searchPatient}
                                        onChange={e => setSearchPatient(e.target.value)}
                                    />
                                    <Button type="button" variant="outline"><Search className="h-4 w-4" /></Button>
                                </div>
                                {searchPatient && (
                                    <div className="max-h-48 overflow-y-auto border rounded-md mt-2">
                                        {citizens.filter(c =>
                                            `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchPatient.toLowerCase()) ||
                                            c.nationalityID.includes(searchPatient)
                                        ).map(c => (
                                            <div
                                                key={c.id}
                                                className="p-3 hover:bg-muted cursor-pointer flex justify-between items-center"
                                                onClick={() => setSelectedPatient(c)}
                                            >
                                                <span>{c.firstName} {c.lastName}</span>
                                                <span className="text-xs text-muted-foreground">{c.nationalityID}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
                                <div>
                                    <p className="font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                                    <p className="text-sm text-muted-foreground">ID: {selectedPatient.nationalityID}</p>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>Changer de patient</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Détails de l'Examen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="examType">Type d'examen *</Label>
                                <Input
                                    id="examType"
                                    placeholder="ex: Radiographie, Analyse sanguine..."
                                    value={formData.examType}
                                    onChange={e => setFormData(p => ({ ...p, examType: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="examDate">Date de l'examen *</Label>
                                <Input
                                    id="examDate"
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="results">Résultats de l'examen *</Label>
                            <Textarea
                                id="results"
                                placeholder="Décrivez les résultats de l'examen de manière détaillée..."
                                className="min-h-[150px]"
                                value={formData.results}
                                onChange={e => setFormData(p => ({ ...p, results: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="observations">Observations complémentaires</Label>
                            <Textarea
                                id="observations"
                                placeholder="Notes additionnelles ou recommandations..."
                                value={formData.observations}
                                onChange={e => setFormData(p => ({ ...p, observations: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="submit" className="w-full md:w-auto" disabled={loading || !selectedPatient}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Enregistrement en cours..." : "Enregistrer l'Examen"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
