"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Calendar, MapPin, Ruler, Weight, User, Download, Plus } from "lucide-react"
import Link from "next/link"

interface BirthRecord {
  id: string
  registrationNumber: string
  childName: string
  gender: string
  birthDate: string
  birthPlace: string
  date: string
  weight?: number
  height?: number
  birthTime?: string
  citizen: {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    placeOfBirth: string
  }
  declarer: {
    id: string
    firstName: string
    lastName: string
  }
  officiant: {
    id: string
    username: string
  }
}

export default function BirthRecordDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const [birthRecord, setBirthRecord] = useState<BirthRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchBirthRecord()
    }
  }, [id])

  const fetchBirthRecord = async () => {
    try {
      const response = await fetch(`/api/birth-records/${id}`)
      if (response.ok) {
        const data = await response.json()
        setBirthRecord(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Acte de naissance introuvable.")
      }
    } catch (err) {
      console.error("Error fetching birth record:", err)
      setError("Erreur interne du serveur lors de la récupération des données.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-red-500">Erreur</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    )
  }

  if (!birthRecord) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => router.back()} variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
        <div className="flex items-center gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Générer le PDF
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Télécharger le PDF
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Acte de Naissance #{birthRecord.registrationNumber}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nom de l'enfant</p>
              <p className="text-lg font-semibold">{birthRecord.childName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sexe</p>
              <Badge variant="outline">{birthRecord.gender}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de naissance</p>
                <p>{new Date(birthRecord.birthDate).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lieu de naissance</p>
                <p>{birthRecord.birthPlace}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Poids</p>
                <p>{birthRecord.weight || "N/A"} kg</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taille</p>
                <p>{birthRecord.height || "N/A"} cm</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Détails du Citoyen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Citoyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{birthRecord.citizen.firstName} {birthRecord.citizen.lastName}</p>
          </CardContent>
        </Card>

        {/* Détails du Déclarant */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Déclarant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{birthRecord.declarer.firstName} {birthRecord.declarer.lastName}</p>
          </CardContent>
        </Card>

        {/* Détails de l'Officier */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Officier d'État Civil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{birthRecord.officiant.username}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
