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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Search } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

// Interface pour le modèle de données Citizen
interface Citizen {
  id: string
  firstName: string
  lastName: string
  nationalityID: string
  birthDate: string
}

export default function NewBirthRecordPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [citizens, setCitizens] = useState<Citizen[]>([])

  // États pour la recherche et la sélection du citoyen (nouveau-né)
  const [searchCitizen, setSearchCitizen] = useState("")
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null)

  // États pour la recherche et la sélection du déclarant
  const [searchDeclarant, setSearchDeclarant] = useState("")
  const [selectedDeclarant, setSelectedDeclarant] = useState<Citizen | null>(null)
  
  // État du formulaire
  const [formData, setFormData] = useState({
    registrationNumber: "",
    birthDate: "",
    birthPlace: "",
    registrationDate: "",
    childName: "",
    gender: "",
    weight: "",
    height: "",
    birthTime: "",
  })

  // Hook pour récupérer la liste des citoyens au chargement de la page
  useEffect(() => {
    const fetchCitizens = async () => {
      try {
        const response = await fetch("/api/citizens")
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des citoyens.")
        }
        const data = await response.json()
        setCitizens(data)
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des citoyens.",
          variant: "destructive",
        })
      }
    }
    fetchCitizens()
  }, [])

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!selectedCitizen || !selectedDeclarant) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner le citoyen et le déclarant.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/birth-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          citizenId: selectedCitizen.id,
          declarerId: selectedDeclarant.id,
          registrationDate: formData.registrationDate,
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
        }),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Acte de naissance créé avec succès",
        })
        router.push("/dashboard/birth-records")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la création")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Impossible de créer l'acte de naissance: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fonctions de filtrage pour les champs de recherche
  const filteredCitizens = citizens.filter(
    (citizen) =>
      citizen.firstName.toLowerCase().includes(searchCitizen.toLowerCase()) ||
      citizen.lastName.toLowerCase().includes(searchCitizen.toLowerCase()) ||
      citizen.nationalityID.includes(searchCitizen)
  )

  const filteredDeclarants = citizens.filter(
    (declarant) =>
      declarant.firstName.toLowerCase().includes(searchDeclarant.toLowerCase()) ||
      declarant.lastName.toLowerCase().includes(searchDeclarant.toLowerCase()) ||
      declarant.nationalityID.includes(searchDeclarant)
  )

  const registrarName = session?.user?.username || "Non disponible"
  const registrarId = session?.user?.id || "Non disponible"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/birth-records">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gov-primary">Nouvel Acte de Naissance</h1>
          <p className="text-muted-foreground">Enregistrer un nouvel acte de naissance</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'Acte</CardTitle>
          <CardDescription>Remplissez tous les champs requis pour créer l'acte de naissance</CardDescription>
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
                <Label htmlFor="citizenId">Citoyen (nouveau-né) *</Label>
                {!selectedCitizen ? (
                  <>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Rechercher le citoyen par nom, prénom ou ID national..."
                        value={searchCitizen}
                        onChange={(e) => setSearchCitizen(e.target.value)}
                      />
                      <Button type="button" variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    {searchCitizen && (
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {filteredCitizens.map((citizen) => (
                          <div
                            key={citizen.id}
                            className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                            onClick={() => setSelectedCitizen(citizen)}
                          >
                            <div className="font-medium">
                              {citizen.firstName} {citizen.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">ID: {citizen.nationalityID}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted">
                    <div>
                      <div className="font-medium">
                        {selectedCitizen.firstName} {selectedCitizen.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">ID: {selectedCitizen.nationalityID}</div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCitizen(null)
                        setSearchCitizen("")
                      }}
                    >
                      Changer
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="childName">Nom de l'enfant *</Label>
                <Input
                  id="childName"
                  value={formData.childName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, childName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Sexe *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le sexe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Masculin</SelectItem>
                    <SelectItem value="FEMALE">Féminin</SelectItem>
                    <SelectItem value="OTHER">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date de naissance *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, birthDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthTime">Heure de naissance *</Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, birthTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Lieu de naissance *</Label>
                <Input
                  id="birthPlace"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData((prev) => ({ ...prev, birthPlace: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Poids (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Taille (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData((prev) => ({ ...prev, height: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="declarerId">Déclarant *</Label>
                {!selectedDeclarant ? (
                  <>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Rechercher le déclarant par nom ou ID national..."
                        value={searchDeclarant}
                        onChange={(e) => setSearchDeclarant(e.target.value)}
                      />
                      <Button type="button" variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    {searchDeclarant && (
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {filteredDeclarants.map((declarant) => (
                          <div
                            key={declarant.id}
                            className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                            onClick={() => setSelectedDeclarant(declarant)}
                          >
                            <div className="font-medium">
                              {declarant.firstName} {declarant.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">ID: {declarant.nationalityID}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted">
                    <div>
                      <div className="font-medium">
                        {selectedDeclarant.firstName} {selectedDeclarant.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">ID: {selectedDeclarant.nationalityID}</div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDeclarant(null)
                        setSearchDeclarant("")
                      }}
                    >
                      Changer
                    </Button>
                  </div>
                )}
              </div>
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
                <Input disabled id="registrar" value={registrarId} placeholder={registrarName}  readOnly className="cursor-not-allowed bg-muted" />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/birth-records">
                <Button variant="outline" type="button">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading || !selectedCitizen || !selectedDeclarant}>
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