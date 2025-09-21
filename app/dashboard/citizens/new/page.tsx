"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewCitizenPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    // Informations personnelles
    firstName: "",
    lastName: "",
    maidenName: "",
    birthDate: "",
    birthPlace: "",
    nationalityID: "",
    nationality: "NATIONAL",
    gender: "",
    ethnicGroup: "",
    community: "",
    territory: "",

    // Contact et adresse
    currentAddress: "",
    phoneNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",

    // Informations médicales
    bloodType: "",
    disabilities: "",

    // Informations socio-économiques
    educationLevel: "",
    profession: "",
    occupation: "",
    religion: "",
    maritalStatus: "SINGLE",

    // Documents officiels
    taxIdentificationNumber: "",
    socialSecurityNumber: "",
    drivingLicenseNumber: "",
    passportNumber: "",
    voterStatus: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/citizens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement")
      }

      const citizen = await response.json()
      router.push(`/dashboard/citizens/${citizen.id}`)
    } catch (error) {
      setError("Une erreur est survenue lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/citizens">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouveau citoyen</h1>
          <p className="text-muted-foreground">Enregistrer un nouveau citoyen dans le système</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
            <TabsTrigger value="contact">Contact & Adresse</TabsTrigger>
            <TabsTrigger value="additional">Informations complémentaires</TabsTrigger>
            <TabsTrigger value="documents">Documents officiels</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Informations de base du citoyen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom de famille *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maidenName">Nom de jeune fille</Label>
                    <Input
                      id="maidenName"
                      value={formData.maidenName}
                      onChange={(e) => handleInputChange("maidenName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationalityID">ID National *</Label>
                    <Input
                      id="nationalityID"
                      value={formData.nationalityID}
                      onChange={(e) => handleInputChange("nationalityID", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Date de naissance *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthPlace">Lieu de naissance *</Label>
                    <Input
                      id="birthPlace"
                      value={formData.birthPlace}
                      onChange={(e) => handleInputChange("birthPlace", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Genre *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Homme</SelectItem>
                        <SelectItem value="FEMALE">Femme</SelectItem>
                        <SelectItem value="OTHER">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationalité *</Label>
                    <Select
                      value={formData.nationality}
                      onValueChange={(value) => handleInputChange("nationality", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NATIONAL">National</SelectItem>
                        <SelectItem value="FOREIGN">Étranger</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact & Adresse</CardTitle>
                <CardDescription>Informations de contact et localisation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentAddress">Adresse actuelle *</Label>
                  <Textarea
                    id="currentAddress"
                    value={formData.currentAddress}
                    onChange={(e) => handleInputChange("currentAddress", e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Contact d'urgence (nom)</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Contact d'urgence (téléphone)</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional">
            <Card>
              <CardHeader>
                <CardTitle>Informations complémentaires</CardTitle>
                <CardDescription>Informations médicales et socio-économiques</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Groupe sanguin</Label>
                    <Select value={formData.bloodType} onValueChange={(value) => handleInputChange("bloodType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le groupe sanguin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A_POSITIVE">A+</SelectItem>
                        <SelectItem value="A_NEGATIVE">A-</SelectItem>
                        <SelectItem value="B_POSITIVE">B+</SelectItem>
                        <SelectItem value="B_NEGATIVE">B-</SelectItem>
                        <SelectItem value="AB_POSITIVE">AB+</SelectItem>
                        <SelectItem value="AB_NEGATIVE">AB-</SelectItem>
                        <SelectItem value="O_POSITIVE">O+</SelectItem>
                        <SelectItem value="O_NEGATIVE">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">État civil</Label>
                    <Select
                      value={formData.maritalStatus}
                      onValueChange={(value) => handleInputChange("maritalStatus", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE">Célibataire</SelectItem>
                        <SelectItem value="MARRIED">Marié(e)</SelectItem>
                        <SelectItem value="DIVORCED">Divorcé(e)</SelectItem>
                        <SelectItem value="WIDOWED">Veuf/Veuve</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      id="profession"
                      value={formData.profession}
                      onChange={(e) => handleInputChange("profession", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="educationLevel">Niveau d'éducation</Label>
                    <Input
                      id="educationLevel"
                      value={formData.educationLevel}
                      onChange={(e) => handleInputChange("educationLevel", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disabilities">Handicaps ou conditions médicales</Label>
                  <Textarea
                    id="disabilities"
                    value={formData.disabilities}
                    onChange={(e) => handleInputChange("disabilities", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents officiels</CardTitle>
                <CardDescription>Numéros de documents et identifiants officiels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxIdentificationNumber">Numéro d'identification fiscale</Label>
                    <Input
                      id="taxIdentificationNumber"
                      value={formData.taxIdentificationNumber}
                      onChange={(e) => handleInputChange("taxIdentificationNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialSecurityNumber">Numéro de sécurité sociale</Label>
                    <Input
                      id="socialSecurityNumber"
                      value={formData.socialSecurityNumber}
                      onChange={(e) => handleInputChange("socialSecurityNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="drivingLicenseNumber">Numéro de permis de conduire</Label>
                    <Input
                      id="drivingLicenseNumber"
                      value={formData.drivingLicenseNumber}
                      onChange={(e) => handleInputChange("drivingLicenseNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportNumber">Numéro de passeport</Label>
                    <Input
                      id="passportNumber"
                      value={formData.passportNumber}
                      onChange={(e) => handleInputChange("passportNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voterStatus">Statut électoral</Label>
                    <Input
                      id="voterStatus"
                      value={formData.voterStatus}
                      onChange={(e) => handleInputChange("voterStatus", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/citizens">
            <Button variant="outline">Annuler</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Enregistrement..." : "Enregistrer le citoyen"}
          </Button>
        </div>
      </form>
    </div>
  )
}
