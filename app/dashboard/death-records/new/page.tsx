"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function NewDeathRecordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    citizenId: "",
    deathDate: "",
    deathPlace: "",
    causeOfDeath: "",
    registrationNumber: "",
    registrationDate: "",
    registrar: "",
    declarant: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/death-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Acte de décès créé avec succès",
        })
        router.push("/dashboard/death-records")
      } else {
        throw new Error("Erreur lors de la création")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'acte de décès",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/death-records">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gov-primary">Nouvel Acte de Décès</h1>
          <p className="text-muted-foreground">Enregistrer un nouvel acte de décès</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du Décès</CardTitle>
          <CardDescription>Remplissez tous les champs requis pour créer l'acte de décès</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Numéro d'enregistrement *</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, registrationNumber: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="citizenId">ID Citoyen *</Label>
                <Input
                  id="citizenId"
                  value={formData.citizenId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, citizenId: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deathDate">Date de décès *</Label>
                <Input
                  id="deathDate"
                  type="date"
                  value={formData.deathDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deathDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deathPlace">Lieu de décès *</Label>
                <Input
                  id="deathPlace"
                  value={formData.deathPlace}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deathPlace: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="causeOfDeath">Cause du décès</Label>
              <Textarea
                id="causeOfDeath"
                value={formData.causeOfDeath}
                onChange={(e) => setFormData((prev) => ({ ...prev, causeOfDeath: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationDate">Date d'enregistrement *</Label>
                <Input
                  id="registrationDate"
                  type="date"
                  value={formData.registrationDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, registrationDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrar">Officier d'état civil *</Label>
                <Input
                  id="registrar"
                  value={formData.registrar}
                  onChange={(e) => setFormData((prev) => ({ ...prev, registrar: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="declarant">Déclarant</Label>
              <Input
                id="declarant"
                value={formData.declarant}
                onChange={(e) => setFormData((prev) => ({ ...prev, declarant: e.target.value }))}
                placeholder="Nom de la personne qui déclare le décès"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observations</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData((prev) => ({ ...prev, observations: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/death-records">
                <Button variant="outline" type="button">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
