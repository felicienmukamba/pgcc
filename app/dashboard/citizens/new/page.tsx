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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Save, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { NATIONALITIES } from "@/lib/nationalities"
import { cn } from "@/lib/utils"

export default function NewCitizenPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    // Informations personnelles
    firstName: "",
    lastName: "",
    maidenName: "",
    birthDate: "",
    birthPlace: "",
    nationalityID: "",
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

  // Helper pour la validation
  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.firstName.trim()) errors.firstName = "Le prénom est requis."
    if (!formData.lastName.trim()) errors.lastName = "Le nom est requis."
    if (!formData.nationalityID.trim()) errors.nationalityID = "L'ID National est requis."
    if (!formData.birthDate) errors.birthDate = "La date de naissance est requise."
    if (!formData.birthPlace.trim()) errors.birthPlace = "Le lieu de naissance est requis."
    if (!formData.gender) errors.gender = "Le genre est requis."
    if (!formData.nationality) errors.nationality = "La nationalité est requise."
    if (!formData.currentAddress.trim()) errors.currentAddress = "L'adresse actuelle est requise."

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")

    if (!validateForm()) {
      setGeneralError("Veuillez corriger les erreurs dans le formulaire avant de continuer.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/citizens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erreur lors de l'enregistrement" }));
        throw new Error(errorData.message || "Erreur lors de l'enregistrement");
      }

      const citizen = await response.json()
      router.push(`/dashboard/citizens/${citizen.id}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement";
      setGeneralError(errorMessage);
    } finally {
      setLoading(false)
    }
  }

  // Composant interne pour les champs de formulaire uniformisés
  const FormField = ({ label, id, required = false, error, children }: { label: string, id: string, required?: boolean, error?: string, children: React.ReactNode }) => (
    <div className="space-y-2">
      <Label htmlFor={id} className={cn("text-sm font-medium", error ? "text-destructive" : "text-slate-700 dark:text-slate-300")}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
    </div>
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium uppercase tracking-wider">
            <Link href="/dashboard/citizens" className="hover:text-primary transition-colors flex items-center gap-1">
              Annuaire
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Nouveau Dossier</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Enrôlement Citoyen</h1>
          <p className="text-slate-500 max-w-xl">
            Remplissez les informations ci-dessous pour créer une nouvelle identité numérique.
            Les champs marqués d'un astérisque (*) sont obligatoires.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/citizens">
            <Button variant="outline" className="h-10">
              Annuler
            </Button>
          </Link>
          <Button onClick={handleSubmit} disabled={loading} className="h-10 min-w-[140px] shadow-lg shadow-primary/20">
            {loading ? <span className="flex items-center gap-2"><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Traitement...</span> : <><Save className="mr-2 h-4 w-4" /> Enregistrer</>}
          </Button>
        </div>
      </div>

      {generalError && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold">Erreur de validation</AlertTitle>
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <TabsTrigger value="personal" className="h-10 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold">Identité Civile</TabsTrigger>
          <TabsTrigger value="contact" className="h-10 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold">Contact & Localisation</TabsTrigger>
          <TabsTrigger value="additional" className="h-10 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold">Profil Socio-Médical</TabsTrigger>
          <TabsTrigger value="documents" className="h-10 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold">Documents & Statuts</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-8">
          <TabsContent value="personal" className="space-y-6 focus-visible:ring-0">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-800">Informations Personnelles</CardTitle>
                <CardDescription>Données fondamentales de l'état civil</CardDescription>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField label="Prénom" id="firstName" required error={fieldErrors.firstName}>
                  <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} className={cn("h-11", fieldErrors.firstName && "border-destructive focus-visible:ring-destructive")} placeholder="Ex: Jean" />
                </FormField>

                <FormField label="Nom de famille" id="lastName" required error={fieldErrors.lastName}>
                  <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} className={cn("h-11", fieldErrors.lastName && "border-destructive focus-visible:ring-destructive")} placeholder="Ex: Mutombo" />
                </FormField>

                <FormField label="Post-nom / Nom de jeune fille" id="maidenName" error={fieldErrors.maidenName}>
                  <Input id="maidenName" value={formData.maidenName} onChange={(e) => handleInputChange("maidenName", e.target.value)} className="h-11" placeholder="Optionnel" />
                </FormField>

                <FormField label="Numéro National (ID)" id="nationalityID" required error={fieldErrors.nationalityID}>
                  <Input id="nationalityID" value={formData.nationalityID} onChange={(e) => handleInputChange("nationalityID", e.target.value)} className={cn("h-11 bg-slate-50 font-mono tracking-wide", fieldErrors.nationalityID && "border-destructive focus-visible:ring-destructive")} placeholder="Ex: 00-92839-223" />
                </FormField>

                <FormField label="Date de naissance" id="birthDate" required error={fieldErrors.birthDate}>
                  <Input id="birthDate" type="date" value={formData.birthDate} onChange={(e) => handleInputChange("birthDate", e.target.value)} className={cn("h-11", fieldErrors.birthDate && "border-destructive focus-visible:ring-destructive")} />
                </FormField>

                <FormField label="Lieu de naissance" id="birthPlace" required error={fieldErrors.birthPlace}>
                  <Input id="birthPlace" value={formData.birthPlace} onChange={(e) => handleInputChange("birthPlace", e.target.value)} className={cn("h-11", fieldErrors.birthPlace && "border-destructive focus-visible:ring-destructive")} placeholder="Ex: Kinshasa" />
                </FormField>

                <FormField label="Genre" id="gender" required error={fieldErrors.gender}>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger className={cn("h-11", fieldErrors.gender && "border-destructive ring-destructive")}>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Homme</SelectItem>
                      <SelectItem value="FEMALE">Femme</SelectItem>
                      <SelectItem value="OTHER">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Nationalité" id="nationality" required error={fieldErrors.nationality}>
                  <Select value={formData.nationality} onValueChange={(value) => handleInputChange("nationality", value)}>
                    <SelectTrigger className={cn("h-11", fieldErrors.nationality && "border-destructive ring-destructive")}>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {NATIONALITIES.map((nat) => (
                        <SelectItem key={nat.value} value={nat.value}>{nat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6 focus-visible:ring-0">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-800">Coordonnées</CardTitle>
                <CardDescription>Résidence principale et moyens de contact</CardDescription>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 gap-y-6">
                <FormField label="Adresse de Résidence Actuelle" id="currentAddress" required error={fieldErrors.currentAddress}>
                  <Textarea id="currentAddress" value={formData.currentAddress} onChange={(e) => handleInputChange("currentAddress", e.target.value)} className={cn("min-h-[100px] resize-none", fieldErrors.currentAddress && "border-destructive focus-visible:ring-destructive")} placeholder="Numéro, Avenue, Quartier, Commune, Ville..." />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <FormField label="Téléphone personnel" id="phoneNumber" error={fieldErrors.phoneNumber}>
                    <Input id="phoneNumber" value={formData.phoneNumber} onChange={(e) => handleInputChange("phoneNumber", e.target.value)} className="h-11" placeholder="+243..." />
                  </FormField>

                  <div className="md:col-span-2 pt-4 border-t border-slate-100 mt-2">
                    <Label className="uppercase text-xs font-bold text-slate-400 mb-4 block">En cas d'urgence</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <FormField label="Nom du contact" id="emergencyContactName">
                        <Input id="emergencyContactName" value={formData.emergencyContactName} onChange={(e) => handleInputChange("emergencyContactName", e.target.value)} className="h-11" />
                      </FormField>
                      <FormField label="Téléphone du contact" id="emergencyContactPhone">
                        <Input id="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)} className="h-11" />
                      </FormField>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional" className="space-y-6 focus-visible:ring-0">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-800">Profil Socio-Médical</CardTitle>
                <CardDescription>Informations complémentaires pour les services sociaux</CardDescription>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField label="État Civil" id="maritalStatus">
                  <Select value={formData.maritalStatus} onValueChange={(value) => handleInputChange("maritalStatus", value)}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE">Célibataire</SelectItem>
                      <SelectItem value="MARRIED">Marié(e)</SelectItem>
                      <SelectItem value="DIVORCED">Divorcé(e)</SelectItem>
                      <SelectItem value="WIDOWED">Veuf/Veuve</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Groupe Sanguin" id="bloodType">
                  <Select value={formData.bloodType} onValueChange={(value) => handleInputChange("bloodType", value)}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Inconnu" /></SelectTrigger>
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
                </FormField>

                <FormField label="Profession / Occupation" id="profession">
                  <Input id="profession" value={formData.profession} onChange={(e) => handleInputChange("profession", e.target.value)} className="h-11" />
                </FormField>

                <FormField label="Niveau d'études" id="educationLevel">
                  <Input id="educationLevel" value={formData.educationLevel} onChange={(e) => handleInputChange("educationLevel", e.target.value)} className="h-11" />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Conditions médicales / Handicaps" id="disabilities">
                    <Textarea id="disabilities" value={formData.disabilities} onChange={(e) => handleInputChange("disabilities", e.target.value)} className="min-h-[80px]" placeholder="Aucun" />
                  </FormField>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6 focus-visible:ring-0">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-800">Documents Officiels</CardTitle>
                <CardDescription>Références des autres documents d'identité</CardDescription>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField label="Numéro Impôt (NIF)" id="taxIdentificationNumber">
                  <Input id="taxIdentificationNumber" value={formData.taxIdentificationNumber} onChange={(e) => handleInputChange("taxIdentificationNumber", e.target.value)} className="h-11 font-mono" />
                </FormField>
                <FormField label="Sécurité Sociale (CNSS)" id="socialSecurityNumber">
                  <Input id="socialSecurityNumber" value={formData.socialSecurityNumber} onChange={(e) => handleInputChange("socialSecurityNumber", e.target.value)} className="h-11 font-mono" />
                </FormField>
                <FormField label="Permis de Conduire" id="drivingLicenseNumber">
                  <Input id="drivingLicenseNumber" value={formData.drivingLicenseNumber} onChange={(e) => handleInputChange("drivingLicenseNumber", e.target.value)} className="h-11 font-mono" />
                </FormField>
                <FormField label="Passeport" id="passportNumber">
                  <Input id="passportNumber" value={formData.passportNumber} onChange={(e) => handleInputChange("passportNumber", e.target.value)} className="h-11 font-mono" />
                </FormField>
                <FormField label="Carte d'Électeur" id="voterStatus">
                  <Input id="voterStatus" value={formData.voterStatus} onChange={(e) => handleInputChange("voterStatus", e.target.value)} className="h-11 font-mono" />
                </FormField>
              </CardContent>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  )
}