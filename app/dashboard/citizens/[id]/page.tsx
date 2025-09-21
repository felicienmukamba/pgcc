"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/upload/image-upload"
import { User, Calendar, MapPin, Phone, Mail, Heart, Shield, FileText, Camera } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Définir des sous-interfaces pour les données incluses
interface BirthRecord {
    id: string;
    registrationNumber: string;
    date: string;
    place: string;
    // ... autres champs
}

interface Marriage {
    id: string;
    partner1: { firstName: string, lastName: string };
    partner2: { firstName: string, lastName: string };
    marriageDate: string;
    // ... autres champs
}

interface Consultation {
    id: string;
    date: string;
    diagnosis: string;
    doctor: { username: string };
    // ... autres champs
}

interface Conviction {
    id: string;
    date: string;
    offenseNature: string;
    sentence: string;
    prosecutor: { username: string };
    // ... autres champs
}

interface Complaint {
    id: string;
    date: string;
    description: string;
    plaintiff?: { firstName: string, lastName: string };
    accused?: { firstName: string, lastName: string };
    policeOfficer: { username: string };
    // ... autres champs
}

// Mettre à jour l'interface Citizen avec toutes les relations
interface Citizen {
    id: string;
    firstName: string;
    lastName: string;
    maidenName?: string;
    birthDate: string;
    birthPlace: string;
    nationalityID: string;
    nationality: string;
    gender: string;
    currentAddress: string;
    phoneNumber?: string;
    bloodType?: string;
    maritalStatus: string;
    images: Array<{
        id: string;
        path: string;
    }>;
    user: {
        email: string;
        username: string;
    };
    // Ajout des relations manquantes
    birthRecordChild: BirthRecord | null;
    marriagesAsPartner1: Marriage[];
    marriagesAsPartner2: Marriage[];
    deathRecord: any | null; // Utilisez un type plus précis si vous avez un modèle DeathRecord
    consultations: Consultation[];
    convictions: Conviction[];
    filedComplaints: Complaint[];
    receivedComplaints: Complaint[];
    // Ajout d'autres relations si nécessaire
    father?: { firstName: string, lastName: string };
    mother?: { firstName: string, lastName: string };
}

export default function CitizenDetailPage() {
    const params = useParams()
    const citizenId = params.id as string
    const [citizen, setCitizen] = useState<Citizen | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCitizen()
    }, [citizenId])

    const fetchCitizen = async () => {
        try {
            const response = await fetch(`/api/citizens/${citizenId}`)
            if (response.ok) {
                const data = await response.json()
                setCitizen(data)
            }
        } catch (error) {
            console.error("Error fetching citizen:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = (images: any[]) => {
        // Refresh citizen data to show new images
        fetchCitizen()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!citizen) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Citoyen non trouvé</h2>
                <Button asChild>
                    <Link href="/dashboard/citizens">Retour à la liste</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        {citizen.firstName} {citizen.lastName}
                    </h1>
                    <p className="text-muted-foreground">ID: {citizen.nationalityID}</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline">{citizen.gender}</Badge>
                    <Badge variant="secondary">{citizen.maritalStatus}</Badge>
                </div>
            </div>

            <Tabs defaultValue="personal" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="personal">Personnel</TabsTrigger>
                    <TabsTrigger value="civil">État Civil</TabsTrigger>
                    <TabsTrigger value="medical">Médical</TabsTrigger>
                    <TabsTrigger value="legal">Judiciaire</TabsTrigger>
                    <TabsTrigger value="biometric">Biométrie</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Informations Personnelles
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Prénom</label>
                                        <p className="font-medium">{citizen.firstName}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Nom</label>
                                        <p className="font-medium">{citizen.lastName}</p>
                                    </div>
                                    {citizen.maidenName && (
                                        <div className="col-span-2">
                                            <label className="text-sm font-medium text-muted-foreground">Nom de jeune fille</label>
                                            <p className="font-medium">{citizen.maidenName}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Date de naissance</label>
                                        <p className="font-medium flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(citizen.birthDate).toLocaleDateString("fr-FR")}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Lieu de naissance</label>
                                        <p className="font-medium flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {citizen.birthPlace}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Nationalité</label>
                                        <p className="font-medium">{citizen.nationality}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Genre</label>
                                        <p className="font-medium">{citizen.gender}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Contact & Adresse</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Adresse actuelle</label>
                                    <p className="font-medium flex items-start gap-2">
                                        <MapPin className="h-4 w-4 mt-1" />
                                        {citizen.currentAddress}
                                    </p>
                                </div>
                                {citizen.phoneNumber && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                                        <p className="font-medium flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            {citizen.phoneNumber}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="font-medium flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        {citizen.user.email}
                                    </p>
                                </div>
                                {citizen.bloodType && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Groupe sanguin</label>
                                        <p className="font-medium flex items-center gap-2">
                                            <Heart className="h-4 w-4" />
                                            {citizen.bloodType}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="biometric" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Current Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Camera className="h-5 w-5" />
                                    Photos Existantes
                                </CardTitle>
                                <CardDescription>Images actuellement enregistrées pour ce citoyen</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {citizen.images.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {citizen.images.map((image) => (
                                            <div key={image.id} className="aspect-square relative rounded-lg overflow-hidden border">
                                                <Image
                                                    src={image.path || "/placeholder.svg"}
                                                    alt="Photo du citoyen"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">Aucune photo enregistrée</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Upload New Images */}
                        <ImageUpload citizenId={citizen.id} onUploadComplete={handleImageUpload} maxFiles={5} />
                    </div>
                </TabsContent>

                <TabsContent value="civil">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Documents d'État Civil
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {citizen.birthRecordChild ? (
                                <div className="space-y-2">
                                    <h4 className="text-lg font-semibold">Acte de Naissance</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <p><strong>N° d'enregistrement:</strong> {citizen.birthRecordChild.registrationNumber}</p>
                                        <p><strong>Date:</strong> {new Date(citizen.birthRecordChild.date).toLocaleDateString("fr-FR")}</p>
                                        <p><strong>Lieu:</strong> {citizen.birthRecordChild.place}</p>
                                    </div>
                                    {/* Ajoutez d'autres champs de BirthRecord si nécessaire */}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Aucun acte de naissance enregistré.</p>
                            )}

                            {/* Logique pour afficher les mariages */}
                            <h4 className="text-lg font-semibold mt-4">Actes de Mariage</h4>
                            {citizen.marriagesAsPartner1.length > 0 || citizen.marriagesAsPartner2.length > 0 ? (
                                <>
                                    {citizen.marriagesAsPartner1.map((marriage) => (
                                        <div key={marriage.id} className="border p-4 rounded-md">
                                            <p><strong>Conjoint(e):</strong> {marriage.partner2.firstName} {marriage.partner2.lastName}</p>
                                            <p><strong>Date:</strong> {new Date(marriage.marriageDate).toLocaleDateString("fr-FR")}</p>
                                        </div>
                                    ))}
                                    {citizen.marriagesAsPartner2.map((marriage) => (
                                        <div key={marriage.id} className="border p-4 rounded-md">
                                            <p><strong>Conjoint(e):</strong> {marriage.partner1.firstName} {marriage.partner1.lastName}</p>
                                            <p><strong>Date:</strong> {new Date(marriage.marriageDate).toLocaleDateString("fr-FR")}</p>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <p className="text-muted-foreground">Aucun mariage enregistré.</p>
                            )}

                            {/* Logique pour afficher l'acte de décès si applicable */}
                            {citizen.deathRecord && (
                                <div className="space-y-2 mt-4">
                                    <h4 className="text-lg font-semibold">Acte de Décès</h4>
                                    <p className="text-muted-foreground">Les détails de l'acte de décès seront affichés ici.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="medical">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5" />
                                Dossier Médical
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {citizen.consultations.length > 0 ? (
                                <div className="space-y-4">
                                    {citizen.consultations.map((consultation) => (
                                        <div key={consultation.id} className="border p-4 rounded-md">
                                            <p><strong>Date:</strong> {new Date(consultation.date).toLocaleDateString("fr-FR")}</p>
                                            <p><strong>Diagnostic:</strong> {consultation.diagnosis}</p>
                                            <p><strong>Médecin:</strong> {consultation.doctor.username}</p>
                                            {/* Ajoutez l'affichage des prescriptions si nécessaire */}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Aucun dossier médical enregistré.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="legal">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Casier Judiciaire
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {citizen.convictions.length > 0 ? (
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold">Condamnations</h4>
                                    {citizen.convictions.map((conviction) => (
                                        <div key={conviction.id} className="border p-4 rounded-md">
                                            <p><strong>Date:</strong> {new Date(conviction.date).toLocaleDateString("fr-FR")}</p>
                                            <p><strong>Infraction:</strong> {conviction.offenseNature}</p>
                                            <p><strong>Peine:</strong> {conviction.sentence}</p>
                                            <p><strong>Procureur:</strong> {conviction.prosecutor.username}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Aucune condamnation enregistrée.</p>
                            )}

                            <div className="space-y-4 mt-6">
                                <h4 className="text-lg font-semibold">Plaintes Déposées</h4>
                                {citizen.filedComplaints.length > 0 ? (
                                    <div className="space-y-4">
                                        {citizen.filedComplaints.map((complaint) => (
                                            <div key={complaint.id} className="border p-4 rounded-md">
                                                <p><strong>Date:</strong> {new Date(complaint.date).toLocaleDateString("fr-FR")}</p>
                                                <p><strong>Description:</strong> {complaint.description}</p>
                                                {complaint.accused && <p><strong>Accusé:</strong> {complaint.accused.firstName} {complaint.accused.lastName}</p>}
                                                <p><strong>Agent de police:</strong> {complaint.policeOfficer.username}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Aucune plainte déposée.</p>
                                )}
                            </div>

                            <div className="space-y-4 mt-6">
                                <h4 className="text-lg font-semibold">Plaintes Reçues</h4>
                                {citizen.receivedComplaints.length > 0 ? (
                                    <div className="space-y-4">
                                        {citizen.receivedComplaints.map((complaint) => (
                                            <div key={complaint.id} className="border p-4 rounded-md">
                                                <p><strong>Date:</strong> {new Date(complaint.date).toLocaleDateString("fr-FR")}</p>
                                                <p><strong>Description:</strong> {complaint.description}</p>
                                                {complaint.plaintiff && <p><strong>Plaintif:</strong> {complaint.plaintiff.firstName} {complaint.plaintiff.lastName}</p>}
                                                <p><strong>Agent de police:</strong> {complaint.policeOfficer.username}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Aucune plainte reçue.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}