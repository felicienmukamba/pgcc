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
import { Badge } from "@/components/ui/badge"
import { Save, ArrowLeft, Search, Plus, X } from "lucide-react"
import Link from "next/link"

interface Citizen {
  id: string
  firstName: string
  lastName: string
  nationalityID: string
  birthDate: string
}

interface Medication {
  id: string
  tradeName: string
  genericName: string
  dosage: string
  unit: string
}

export default function NewConsultationPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [citizens, setCitizens] = useState<Citizen[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [searchPatient, setSearchPatient] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Citizen | null>(null)

  const [formData, setFormData] = useState({
    patientId: "",
    date: new Date().toISOString().split("T")[0],
    diagnosis: "",
    duration: "",
    price: "",
    notes: "",
  })

  const [prescriptions, setPrescriptions] = useState<
    Array<{
      dosage: string
      duration: string
      quantity: string
      status: string
      medications: string[]
    }>
  >([])

  useEffect(() => {
    fetchCitizens()
    fetchMedications()
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

  const fetchMedications = async () => {
    try {
      const response = await fetch("/api/medications")
      if (response.ok) {
        const data = await response.json()
        setMedications(data)
      }
    } catch (error) {
      console.error("Error fetching medications:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addPrescription = () => {
    setPrescriptions((prev) => [
      ...prev,
      {
        dosage: "",
        duration: "",
        quantity: "",
        status: "ACTIVE",
        medications: [],
      },
    ])
  }

  const removePrescription = (index: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index))
  }

  const updatePrescription = (index: number, field: string, value: string | string[]) => {
    setPrescriptions((prev) =>
      prev.map((prescription, i) => (i === index ? { ...prescription, [field]: value } : prescription)),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!selectedPatient) {
      setError("Veuillez sélectionner un patient")
      setLoading(false)
      return
    }

    try {
      const consultationData = {
        ...formData,
        patientId: selectedPatient.id,
        price: Number.parseFloat(formData.price),
        prescriptions,
      }

      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(consultationData),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement")
      }

      const consultation = await response.json()
      router.push(`/dashboard/consultations/${consultation.id}`)
    } catch (error) {
      setError("Une erreur est survenue lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  const filteredCitizens = citizens.filter(
    (citizen) =>
      citizen.firstName.toLowerCase().includes(searchPatient.toLowerCase()) ||
      citizen.lastName.toLowerCase().includes(searchPatient.toLowerCase()) ||
      citizen.nationalityID.includes(searchPatient),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/consultations">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouvelle consultation</h1>
          <p className="text-muted-foreground">Enregistrer une nouvelle consultation médicale</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Sélection du patient</CardTitle>
            <CardDescription>Recherchez et sélectionnez le patient pour cette consultation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedPatient ? (
              <>
                <div className="flex gap-2">
                  <Input
                    placeholder="Rechercher par nom, prénom ou ID national..."
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                  />
                  <Button type="button" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {searchPatient && (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredCitizens.map((citizen) => (
                      <div
                        key={citizen.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                        onClick={() => setSelectedPatient(citizen)}
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
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">ID: {selectedPatient.nationalityID}</div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedPatient(null)}>
                  Changer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consultation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de la consultation</CardTitle>
            <CardDescription>Informations sur la consultation médicale</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date de consultation *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durée *</Label>
                <Input
                  id="duration"
                  placeholder="ex: 30 minutes"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnostic *</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) => handleInputChange("diagnosis", e.target.value)}
                required
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes complémentaires</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Prescriptions
              <Button type="button" variant="outline" size="sm" onClick={addPrescription}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter prescription
              </Button>
            </CardTitle>
            <CardDescription>Médicaments prescrits lors de cette consultation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescriptions.map((prescription, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Prescription {index + 1}</h4>
                  <Button type="button" variant="outline" size="sm" onClick={() => removePrescription(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Posologie</Label>
                    <Input
                      placeholder="ex: 1 comprimé 3x/jour"
                      value={prescription.dosage}
                      onChange={(e) => updatePrescription(index, "dosage", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Durée</Label>
                    <Input
                      placeholder="ex: 7 jours"
                      value={prescription.duration}
                      onChange={(e) => updatePrescription(index, "duration", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantité</Label>
                    <Input
                      placeholder="ex: 21 comprimés"
                      value={prescription.quantity}
                      onChange={(e) => updatePrescription(index, "quantity", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Médicaments</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      const currentMeds = prescription.medications
                      if (!currentMeds.includes(value)) {
                        updatePrescription(index, "medications", [...currentMeds, value])
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ajouter un médicament" />
                    </SelectTrigger>
                    <SelectContent>
                      {medications.map((med) => (
                        <SelectItem key={med.id} value={med.id}>
                          {med.tradeName} ({med.genericName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {prescription.medications.map((medId) => {
                      const med = medications.find((m) => m.id === medId)
                      return (
                        <Badge key={medId} variant="secondary" className="flex items-center gap-1">
                          {med?.tradeName}
                          <button
                            type="button"
                            onClick={() =>
                              updatePrescription(
                                index,
                                "medications",
                                prescription.medications.filter((id) => id !== medId),
                              )
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/consultations">
            <Button variant="outline">Annuler</Button>
          </Link>
          <Button type="submit" disabled={loading || !selectedPatient}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Enregistrement..." : "Enregistrer la consultation"}
          </Button>
        </div>
      </form>
    </div>
  )
}
