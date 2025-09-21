"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
}

export default function NewPrescriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [medications, setMedications] = useState<any[]>([])
  const [formData, setFormData] = useState({
    consultationId: "",
    prescribedMedications: [{ medicationId: "", dosage: "", frequency: "", duration: "", instructions: "" }],
    generalInstructions: "",
  })

  useEffect(() => {
    fetchMedications()
  }, [])

  const fetchMedications = async () => {
    try {
      const response = await fetch("/api/medications")
      if (response.ok) {
        const data = await response.json()
        setMedications(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des médicaments:", error)
    }
  }

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      prescribedMedications: [
        ...prev.prescribedMedications,
        { medicationId: "", dosage: "", frequency: "", duration: "", instructions: "" },
      ],
    }))
  }

  const removeMedication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      prescribedMedications: prev.prescribedMedications.filter((_, i) => i !== index),
    }))
  }

  const updateMedication = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      prescribedMedications: prev.prescribedMedications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med,
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Prescription créée avec succès",
        })
        router.push("/dashboard/prescriptions")
      } else {
        throw new Error("Erreur lors de la création")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la prescription",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/prescriptions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gov-primary">Nouvelle Prescription</h1>
          <p className="text-muted-foreground">Créer une nouvelle prescription médicale</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la Prescription</CardTitle>
          <CardDescription>Remplissez tous les champs requis pour créer la prescription</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="consultationId">ID Consultation *</Label>
              <Input
                id="consultationId"
                value={formData.consultationId}
                onChange={(e) => setFormData((prev) => ({ ...prev, consultationId: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Médicaments prescrits</Label>
                <Button type="button" onClick={addMedication} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter médicament
                </Button>
              </div>

              {formData.prescribedMedications.map((medication, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Médicament {index + 1}</h4>
                    {formData.prescribedMedications.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeMedication(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Médicament *</Label>
                      <Select
                        value={medication.medicationId}
                        onValueChange={(value) => updateMedication(index, "medicationId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un médicament" />
                        </SelectTrigger>
                        <SelectContent>
                          {medications.map((med) => (
                            <SelectItem key={med.id} value={med.id}>
                              {med.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Dosage *</Label>
                      <Input
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                        placeholder="ex: 500mg"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Fréquence *</Label>
                      <Input
                        value={medication.frequency}
                        onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                        placeholder="ex: 3 fois par jour"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Durée *</Label>
                      <Input
                        value={medication.duration}
                        onChange={(e) => updateMedication(index, "duration", e.target.value)}
                        placeholder="ex: 7 jours"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label>Instructions spéciales</Label>
                    <Textarea
                      value={medication.instructions}
                      onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                      rows={2}
                      placeholder="Instructions particulières pour ce médicament..."
                    />
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="generalInstructions">Instructions générales</Label>
              <Textarea
                id="generalInstructions"
                value={formData.generalInstructions}
                onChange={(e) => setFormData((prev) => ({ ...prev, generalInstructions: e.target.value }))}
                rows={3}
                placeholder="Instructions générales pour le patient..."
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/prescriptions">
                <Button variant="outline" type="button">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Création..." : "Créer prescription"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
