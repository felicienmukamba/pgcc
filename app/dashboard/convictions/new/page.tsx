"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function NewConvictionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    citizenId: "",
    offense: "",
    court: "",
    judgmentDate: "",
    sentence: "",
    sentenceType: "FINE",
    status: "ACTIVE",
    appealStatus: "NONE",
    observations: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/convictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Condamnation enregistrée avec succès",
        })
        router.push("/dashboard/convictions")
      } else {
        throw new Error("Erreur lors de la création")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la condamnation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/convictions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gov-primary">Nouvelle Condamnation</h1>
          <p className="text-muted-foreground">Enregistrer une nouvelle condamnation</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la Condamnation</CardTitle>
          <CardDescription>Remplissez tous les champs requis pour enregistrer la condamnation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="citizenId">ID Citoyen *</Label>
              <Input
                id="citizenId"
                value={formData.citizenId}
                onChange={(e) => setFormData((prev) => ({ ...prev, citizenId: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="offense">Infraction *</Label>
              <Textarea
                id="offense"
                value={formData.offense}
                onChange={(e) => setFormData((prev) => ({ ...prev, offense: e.target.value }))}
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="court">Tribunal *</Label>
                <Input
                  id="court"
                  value={formData.court}
                  onChange={(e) => setFormData((prev) => ({ ...prev, court: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="judgmentDate">Date du jugement *</Label>
                <Input
                  id="judgmentDate"
                  type="date"
                  value={formData.judgmentDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, judgmentDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sentence">Sentence *</Label>
              <Textarea
                id="sentence"
                value={formData.sentence}
                onChange={(e) => setFormData((prev) => ({ ...prev, sentence: e.target.value }))}
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sentenceType">Type de sentence *</Label>
                <Select
                  value={formData.sentenceType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, sentenceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FINE">Amende</SelectItem>
                    <SelectItem value="IMPRISONMENT">Emprisonnement</SelectItem>
                    <SelectItem value="COMMUNITY_SERVICE">Service communautaire</SelectItem>
                    <SelectItem value="PROBATION">Probation</SelectItem>
                    <SelectItem value="SUSPENDED">Sursis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Statut *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Actif</SelectItem>
                    <SelectItem value="COMPLETED">Terminé</SelectItem>
                    <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appealStatus">Statut d'appel</Label>
                <Select
                  value={formData.appealStatus}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, appealStatus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Aucun</SelectItem>
                    <SelectItem value="PENDING">En cours</SelectItem>
                    <SelectItem value="ACCEPTED">Accepté</SelectItem>
                    <SelectItem value="REJECTED">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              <Link href="/dashboard/convictions">
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
