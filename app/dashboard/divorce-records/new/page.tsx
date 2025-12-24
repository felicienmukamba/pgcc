"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Search, UserMinus } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface Citizen {
    id: string
    firstName: string
    lastName: string
    nationalityID: string
}

export default function NewDivorceRecordPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [citizens, setCitizens] = useState<Citizen[]>([])

    const [searchPartner1, setSearchPartner1] = useState("")
    const [selectedPartner1, setSelectedPartner1] = useState<Citizen | null>(null)

    const [searchPartner2, setSearchPartner2] = useState("")
    const [selectedPartner2, setSelectedPartner2] = useState<Citizen | null>(null)

    const [searchWitness1, setSearchWitness1] = useState("")
    const [selectedWitness1, setSelectedWitness1] = useState<Citizen | null>(null)

    const [searchWitness2, setSearchWitness2] = useState("")
    const [selectedWitness2, setSelectedWitness2] = useState<Citizen | null>(null)

    const [formData, setFormData] = useState({
        registrationNumber: "",
        divorceDate: "",
        divorcePlace: "",
        reason: "",
        judgementNumber: "",
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
                toast({
                    title: "Erreur",
                    description: "Impossible de charger les citoyens.",
                    variant: "destructive",
                })
            }
        }
        fetchCitizens()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!selectedPartner1 || !selectedPartner2 || !selectedWitness1 || !selectedWitness2) {
            toast({
                title: "Erreur",
                description: "Veuillez sélectionner toutes les parties requises.",
                variant: "destructive",
            })
            setLoading(false)
            return
        }

        try {
            const response = await fetch("/api/divorce-records", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    partner1Id: selectedPartner1.id,
                    partner2Id: selectedPartner2.id,
                    witness1Id: selectedWitness1.id,
                    witness2Id: selectedWitness2.id,
                }),
            })

            if (response.ok) {
                toast({ title: "Succès", description: "Acte de divorce créé avec succès" })
                router.push("/dashboard/divorce-records")
            } else {
                const errorData = await response.json()
                throw new Error(errorData.error || "Erreur lors de la création")
            }
        } catch (error) {
            toast({
                title: "Erreur",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const renderCitizenSelector = (
        label: string,
        search: string,
        setSearch: (v: string) => void,
        selected: Citizen | null,
        setSelected: (c: Citizen | null) => void
    ) => (
        <div className="space-y-2">
            <Label>{label} *</Label>
            {!selected ? (
                <>
                    <div className="flex gap-2">
                        <Input
                            placeholder={`Rechercher ${label.toLowerCase()}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button type="button" variant="outline"><Search className="h-4 w-4" /></Button>
                    </div>
                    {search && (
                        <div className="max-h-32 overflow-y-auto border rounded-md mt-1">
                            {citizens.filter(c =>
                                `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
                                c.nationalityID.includes(search)
                            ).map(c => (
                                <div
                                    key={c.id}
                                    className="p-2 hover:bg-muted cursor-pointer text-sm"
                                    onClick={() => { setSelected(c); setSearch(""); }}
                                >
                                    {c.firstName} {c.lastName} ({c.nationalityID})
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="flex items-center justify-between p-2 border rounded-md bg-muted text-sm">
                    <span>{selected.firstName} {selected.lastName}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(null)}>Changer</Button>
                </div>
            )}
        </div>
    )

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/divorce-records">
                    <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-2" /> Retour</Button>
                </Link>
                <h1 className="text-2xl font-bold">Nouvel Acte de Divorce</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Partenaires Concernés</CardTitle>
                        <CardDescription>Sélectionnez les deux conjoints</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderCitizenSelector("Premier Partenaire", searchPartner1, setSearchPartner1, selectedPartner1, setSelectedPartner1)}
                        {renderCitizenSelector("Deuxième Partenaire", searchPartner2, setSearchPartner2, selectedPartner2, setSelectedPartner2)}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Détails du Divorce</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="registrationNumber">N° Enregistrement *</Label>
                            <Input id="registrationNumber" value={formData.registrationNumber} onChange={e => setFormData(p => ({ ...p, registrationNumber: e.target.value }))} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="judgementNumber">N° Jugement</Label>
                            <Input id="judgementNumber" value={formData.judgementNumber} onChange={e => setFormData(p => ({ ...p, judgementNumber: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="divorceDate">Date du Divorce *</Label>
                            <Input id="divorceDate" type="date" value={formData.divorceDate} onChange={e => setFormData(p => ({ ...p, divorceDate: e.target.value }))} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="divorcePlace">Lieu du Divorce *</Label>
                            <Input id="divorcePlace" value={formData.divorcePlace} onChange={e => setFormData(p => ({ ...p, divorcePlace: e.target.value }))} required />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="reason">Motif / Observations</Label>
                            <Textarea id="reason" value={formData.reason} onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Témoins</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderCitizenSelector("Premier Témoin", searchWitness1, setSearchWitness1, selectedWitness1, setSelectedWitness1)}
                        {renderCitizenSelector("Deuxième Témoin", searchWitness2, setSearchWitness2, selectedWitness2, setSelectedWitness2)}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="submit" variant="destructive" disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Enregistrement..." : "Enregistrer l'Acte de Divorce"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
