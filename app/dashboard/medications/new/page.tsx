"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Pill } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function NewMedicationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tradeName: "",
    genericName: "",
    dosage: "",
    unit: "",
    adminRoute: "",
    manufacturer: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Médicament créé avec succès",
        })
        router.push("/dashboard/medications")
      } else {
        throw new Error("Erreur lors de la création")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le médicament",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/medications">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gov-primary">Nouveau Médicament</h1>
          <p className="text-muted-foreground">Créer un nouveau médicament</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations sur le médicament</CardTitle>
          <CardDescription>Remplissez tous les champs requis pour ajouter le médicament</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tradeName">Nom commercial *</Label>
                <Input
                  id="tradeName"
                  value={formData.tradeName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tradeName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genericName">Nom générique *</Label>
                <Input
                  id="genericName"
                  value={formData.genericName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, genericName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage *</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dosage: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unité *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminRoute">Voie d'administration *</Label>
                <Input
                  id="adminRoute"
                  value={formData.adminRoute}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adminRoute: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Fabricant *</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optionnel)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/medications">
                <Button variant="outline" type="button">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Création..." : "Créer médicament"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
