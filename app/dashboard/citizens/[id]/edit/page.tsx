"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Save, ArrowLeft } from "lucide-react"

import { NATIONALITIES } from "@/lib/nationalities"

// Define the required props for the page component
export default function EditCitizenPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const citizenId = params.id

  const [loading, setLoading] = useState(false) // For save/update button
  const [isFetching, setIsFetching] = useState(true) // For initial data load
  const [error, setError] = useState("")
  const [notFound, setNotFound] = useState(false)
  const [citizenName, setCitizenName] = useState("...")

  // Initial state structure matching the form
  const [formData, setFormData] = useState({
    // Informations personnelles
    firstName: "",
    lastName: "",
    maidenName: "",
    birthDate: "", // YYYY-MM-DD format
    birthPlace: "",
    nationality: "CONGOLAISE",
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

  // Helper function to convert Date object/string to YYYY-MM-DD string for input[type=date]
  const formatDate = (dateString: string | Date | null): string => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  // Effect to fetch existing data on component mount
  useEffect(() => {
    const fetchCitizenData = async () => {
      setIsFetching(true)
      setError("")
      try {
        const response = await fetch(`/api/citizens/${citizenId}`)
        if (response.status === 404) {
          setNotFound(true)
          return
        }
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données du citoyen.")
        }

        const citizenData = await response.json()
        setCitizenName(`${citizenData.firstName} ${citizenData.lastName}`)

        // Map fetched data to formData state, ensuring nulls/undefined are handled
        setFormData({
          firstName: citizenData.firstName || "",
          lastName: citizenData.lastName || "",
          maidenName: citizenData.maidenName || "",
          birthDate: formatDate(citizenData.birthDate), // Format date
          birthPlace: citizenData.birthPlace || "",
          nationality: citizenData.nationality || "NATIONAL",
          gender: citizenData.gender || "",
          ethnicGroup: citizenData.ethnicGroup || "",
          community: citizenData.community || "",
          territory: citizenData.territory || "",

          currentAddress: citizenData.currentAddress || "",
          phoneNumber: citizenData.phoneNumber || "",
          emergencyContactName: citizenData.emergencyContactName || "",
          emergencyContactPhone: citizenData.emergencyContactPhone || "",

          bloodType: citizenData.bloodType || "",
          disabilities: citizenData.disabilities || "",

          educationLevel: citizenData.educationLevel || "",
          profession: citizenData.profession || "",
          occupation: citizenData.occupation || "",
          religion: citizenData.religion || "",
          maritalStatus: citizenData.maritalStatus || "SINGLE",

          taxIdentificationNumber: citizenData.taxIdentificationNumber || "",
          socialSecurityNumber: citizenData.socialSecurityNumber || "",
          drivingLicenseNumber: citizenData.drivingLicenseNumber || "",
          passportNumber: citizenData.passportNumber || "",
          voterStatus: citizenData.voterStatus || "",
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger les données. Veuillez réessayer.")
      } finally {
        setIsFetching(false)
      }
    }

    if (citizenId) {
      fetchCitizenData()
    }
  }, [citizenId])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/citizens/${citizenId}`, {
        method: "PUT", // Use PUT for updating an existing resource
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la mise à jour")
      }

      const citizen = await response.json()
      // Redirect to the citizen's detail page after successful update
      router.push(`/dashboard/citizens/${citizen.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de la mise à jour.")
    } finally {
      setLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl text-gray-500">Chargement des données du citoyen...</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="text-center py-20 bg-card rounded-xl shadow-lg m-10">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTitle>Citoyen non trouvé</AlertTitle>
          <AlertDescription>Aucun citoyen avec l'ID #{citizenId} n'a été trouvé.</AlertDescription>
        </Alert>
        <Link href="/dashboard/citizens" className="mt-6 inline-block">
          <Button>Retour à la liste des citoyens</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/citizens/${citizenId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier citoyen: {citizenName}</h1>
          <p className="text-muted-foreground">
            Mettre à jour les informations du citoyen #<span className="font-mono">{citizenId}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Label htmlFor="maidenName">Nom de jeune fille/précédent</Label>
                    <Input
                      id="maidenName"
                      value={formData.maidenName}
                      onChange={(e) => handleInputChange("maidenName", e.target.value)}
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
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)} required>
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
                        <SelectValue placeholder="Sélectionner la nationalité" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Mappage sur la nouvelle liste de nationalités */}
                        {NATIONALITIES.map((nat) => (
                          <SelectItem key={nat.value} value={nat.value}>
                            {nat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ethnicGroup">Groupe ethnique</Label>
                    <Input
                      id="ethnicGroup"
                      value={formData.ethnicGroup}
                      onChange={(e) => handleInputChange("ethnicGroup", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="community">Communauté</Label>
                    <Input
                      id="community"
                      value={formData.community}
                      onChange={(e) => handleInputChange("community", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="territory">Territoire</Label>
                    <Input
                      id="territory"
                      value={formData.territory}
                      onChange={(e) => handleInputChange("territory", e.target.value)}
                    />
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
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange("occupation", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="religion">Religion</Label>
                    <Input
                      id="religion"
                      value={formData.religion}
                      onChange={(e) => handleInputChange("religion", e.target.value)}
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
          <Link href={`/dashboard/citizens/${citizenId}`}>
            <Button variant="outline" disabled={loading}>
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading || isFetching}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Mise à jour..." : "Mettre à jour le citoyen"}
          </Button>
        </div>
      </form>
    </div>
  )
}
