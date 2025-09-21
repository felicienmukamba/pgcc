"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"

interface Citizen {
  id: string
  firstName: string
  lastName: string
  nationalityID: string
  birthDate: string
}

interface User {
  id: string
  username: string
  roles: string[]
}

export default function NewComplaintPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [citizens, setCitizens] = useState<Citizen[]>([])
  const [officers, setOfficers] = useState<User[]>([])
  const [searchPlaintiff, setSearchPlaintiff] = useState("")
  const [searchAccused, setSearchAccused] = useState("")
  const [selectedPlaintiff, setSelectedPlaintiff] = useState<Citizen | null>(null)
  const [selectedAccused, setSelectedAccused] = useState<Citizen | null>(null)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    place: "",
    type: "",
    witnesses: "",
    evidence: "",
    policeOfficerId: "",
  })

  const complaintTypes = [
    "Vol",
    "Agression physique",
    "Agression verbale",
    "Harcèlement",
    "Vandalisme",
    "Fraude",
    "Violence domestique",
    "Cambriolage",
    "Escroquerie",
    "Menaces",
    "Diffamation",
    "Autre",
  ]

  useEffect(() => {
    fetchCitizens()
    fetchOfficers()
  }, [])

  const fetchCitizens = async () => {
    try {
      const response = await fetch("/api/citizens")
      if (response.ok) {
        const data = await response.json()
        setCitizens(data)
      }
    } catch (error) {
      console.error("Error fetching citizens:", error)
    }
  }

  const fetchOfficers = async () => {
    try {
      const response = await fetch("/api/users?role=OPJ")
      if (response.ok) {
        const data = await response.json()
        setOfficers(data)
      }
    } catch (error) {
      console.error("Error fetching officers:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!selectedPlaintiff) {
      setError("Veuillez sélectionner un plaignant")
      setLoading(false)
      return
    }

    try {
      const complaintData = {
        ...formData,
        plaintiffId: selectedPlaintiff.id,
        accusedId: selectedAccused?.id || null,
      }

      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(complaintData),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement")
      }

      const complaint = await response.json()
      router.push(`/dashboard/complaints/${complaint.id}`)
    } catch (error) {
      setError("Une erreur est survenue lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  const filteredCitizensForPlaintiff = citizens.filter(
    (citizen) =>
      citizen.firstName.toLowerCase().includes(searchPlaintiff.toLowerCase()) ||
      citizen.lastName.toLowerCase().includes(searchPlaintiff.toLowerCase()) ||
      citizen.nationalityID.includes(searchPlaintiff),
  )

  const filteredCitizensForAccused = citizens.filter(
    (citizen) =>
      citizen.firstName.toLowerCase().includes(searchAccused.toLowerCase()) ||
      citizen.lastName.toLowerCase().includes(searchAccused.toLowerCase()) ||
      citizen.nationalityID.includes(searchAccused),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/complaints">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouvelle plainte</h1>
          <p className="text-muted-foreground">Enregistrer une nouvelle plainte</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plaintiff Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Plaignant</CardTitle>
            <CardDescription>Sélectionnez le citoyen qui dépose la plainte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedPlaintiff ? (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="Rechercher le plaignant par nom, prénom ou ID national..."
                    value={searchPlaintiff}
                    onChange={(e) => setSearchPlaintiff(e.target.value)}
                  />
                  <Button type="button" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {searchPlaintiff && (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredCitizensForPlaintiff.map((citizen) => (
                      <div
                        key={citizen.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                        onClick={() => setSelectedPlaintiff(citizen)}
                      >
                        <div className="font-medium">
                          {citizen.firstName} {citizen.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {citizen.nationalityID} • Né(e) le{" "}
                          {new Date(citizen.birthDate).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted">
                <div>
                  <div className="font-medium">
                    {selectedPlaintiff.firstName} {selectedPlaintiff.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">ID: {selectedPlaintiff.nationalityID}</div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedPlaintiff(null)}>
                  Changer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accused Selection (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle>Accusé (optionnel)</CardTitle>
            <CardDescription>Sélectionnez la personne accusée si elle est connue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedAccused ? (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="Rechercher l'accusé par nom, prénom ou ID national..."
                    value={searchAccused}
                    onChange={(e) => setSearchAccused(e.target.value)}
                  />
                  <Button type="button" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {searchAccused && (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredCitizensForAccused.map((citizen) => (
                      <div
                        key={citizen.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                        onClick={() => setSelectedAccused(citizen)}
                      >
                        <div className="font-medium">
                          {citizen.firstName} {citizen.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {citizen.nationalityID} • Né(e) le{" "}
                          {new Date(citizen.birthDate).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted">
                <div>
                  <div className="font-medium">
                    {selectedAccused.firstName} {selectedAccused.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">ID: {selectedAccused.nationalityID}</div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedAccused(null)}>
                  Retirer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complaint Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de la plainte</CardTitle>
            <CardDescription>Informations sur l'incident</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date de l'incident *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type de plainte *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    {complaintTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="place">Lieu de l'incident *</Label>
              <Input
                id="place"
                value={formData.place}
                onChange={(e) => handleInputChange("place", e.target.value)}
                required
                placeholder="Adresse ou lieu où s'est déroulé l'incident"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description détaillée *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                required
                rows={5}
                placeholder="Décrivez en détail ce qui s'est passé..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="witnesses">Témoins</Label>
                <Textarea
                  id="witnesses"
                  value={formData.witnesses}
                  onChange={(e) => handleInputChange("witnesses", e.target.value)}
                  rows={3}
                  placeholder="Noms et coordonnées des témoins..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evidence">Preuves</Label>
                <Textarea
                  id="evidence"
                  value={formData.evidence}
                  onChange={(e) => handleInputChange("evidence", e.target.value)}
                  rows={3}
                  placeholder="Description des preuves disponibles..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="policeOfficerId">Officier de police judiciaire *</Label>
              <Select
                value={formData.policeOfficerId}
                onValueChange={(value) => handleInputChange("policeOfficerId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un OPJ" />
                </SelectTrigger>
                <SelectContent>
                  {officers.map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/complaints">
            <Button variant="outline">Annuler</Button>
          </Link>
          <Button type="submit" disabled={loading || !selectedPlaintiff}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Enregistrement..." : "Enregistrer la plainte"}
          </Button>
        </div>
      </form>
    </div>
  )
}
