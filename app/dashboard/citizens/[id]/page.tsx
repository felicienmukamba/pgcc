"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/upload/image-upload"
import {
    User, Calendar, MapPin, Phone, Mail, Heart, Shield, FileText, Camera,
    ArrowLeft, AlertTriangle, Gavel, Stethoscope
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

import { CitizenCardDisplay } from "@/components/CitizenCardDisplay";

interface BirthRecord {
    id: string;
    registrationNumber: string;
    date: string;
    place: string;
}

interface Marriage {
    id: string;
    partner1: { firstName: string, lastName: string };
    partner2: { firstName: string, lastName: string };
    marriageDate: string;
}

interface Consultation {
    id: string;
    date: string;
    diagnosis: string;
    doctor: { username: string };
}

interface Conviction {
    id: string;
    date: string;
    offenseNature: string;
    sentence: string;
    prosecutor: { username: string };
}

interface Complaint {
    id: string;
    date: string;
    description: string;
    plaintiff?: { firstName: string, lastName: string };
    accused?: { firstName: string, lastName: string };
    policeOfficer: { username: string };
}

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
    birthRecordChild: BirthRecord | null;
    marriagesAsPartner1: Marriage[];
    marriagesAsPartner2: Marriage[];
    deathRecord: any | null;
    consultations: Consultation[];
    convictions: Conviction[];
    filedComplaints: Complaint[];
    receivedComplaints: Complaint[];
}

const DetailRow = ({ icon: Icon, label, value, className }: { icon?: any, label: string, value: string | React.ReactNode, className?: string }) => (
    <div className={cn("flex flex-col space-y-1", className)}>
        <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {label}
        </dt>
        <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value || "—"}</dd>
    </div>
)

export default function CitizenDetailPage() {
    const params = useParams()
    const router = useRouter()
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
        fetchCitizen()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!citizen) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <h2 className="text-2xl font-bold">Citoyen introuvable</h2>
                <Button onClick={() => router.push("/dashboard/citizens")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à l'annuaire
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-200 pb-6">
                <div className="flex items-start gap-4">
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 mt-1" onClick={() => router.push("/dashboard/citizens")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">
                            {citizen.firstName} {citizen.lastName}
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold tracking-wide">
                                {citizen.nationalityID}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {citizen.birthPlace}</span>
                            <span>•</span>
                            <span>{new Date(citizen.birthDate).getFullYear()} ({new Date().getFullYear() - new Date(citizen.birthDate).getFullYear()} ans)</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={citizen.gender === 'MALE' ? 'default' : 'secondary'} className="h-7 px-3 text-xs uppercase tracking-wider">{citizen.gender}</Badge>
                    <Badge variant="outline" className="h-7 px-3 text-xs uppercase tracking-wider border-slate-300">{citizen.maritalStatus}</Badge>
                    <Button size="sm" variant="outline" className="hidden md:inline-flex" onClick={() => window.print()}>
                        Imprimer le dossier
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="personal" className="space-y-8">
                <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-slate-100/80 rounded-lg space-x-1">
                    <TabsTrigger value="personal" className="px-4 py-2 font-semibold">Identité & Contact</TabsTrigger>
                    <TabsTrigger value="civil" className="px-4 py-2 font-semibold">État Civil</TabsTrigger>
                    <TabsTrigger value="medical" className="px-4 py-2 font-semibold">Dossier Médical</TabsTrigger>
                    <TabsTrigger value="legal" className="px-4 py-2 font-semibold">Casier Judiciaire</TabsTrigger>
                    <TabsTrigger value="biometric" className="px-4 py-2 font-semibold">Biométrie & Carte</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2 shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <User className="h-5 w-5 text-slate-500" />
                                    Informations Personnelles
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
                                    <DetailRow label="Prénom" value={citizen.firstName} />
                                    <DetailRow label="Nom" value={citizen.lastName} />
                                    <DetailRow label="Nom de jeune fille" value={citizen.maidenName} />
                                    <DetailRow label="Date de naissance" value={new Date(citizen.birthDate).toLocaleDateString("fr-FR")} icon={Calendar} />
                                    <DetailRow label="Lieu de naissance" value={citizen.birthPlace} icon={MapPin} />
                                    <DetailRow label="Nationalité" value={citizen.nationality} />
                                    <DetailRow label="Genre" value={citizen.gender} />
                                    <DetailRow label="Groupe Sanguin" value={citizen.bloodType} icon={Heart} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm h-fit">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-slate-500" />
                                    Contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <DetailRow label="Adresse de résidence" value={citizen.currentAddress} icon={MapPin} />
                                <DetailRow label="Téléphone" value={citizen.phoneNumber} icon={Phone} />
                                <DetailRow label="Email (Compte)" value={citizen.user.email} icon={Mail} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="civil" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2">
                    <Card className="shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-slate-500" />
                                Documents d'État Civil
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            <div>
                                <h3 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-4 border-b border-slate-100 pb-2">Acte de Naissance</h3>
                                {citizen.birthRecordChild ? (
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <DetailRow label="Numéro d'acte" value={citizen.birthRecordChild.registrationNumber} />
                                        <DetailRow label="Date d'enregistrement" value={new Date(citizen.birthRecordChild.date).toLocaleDateString("fr-FR")} />
                                        <DetailRow label="Lieu" value={citizen.birthRecordChild.place} />
                                    </div>
                                ) : (
                                    <div className="text-slate-400 italic text-sm">Aucun acte de naissance lié.</div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-4 border-b border-slate-100 pb-2">Mariages</h3>
                                {citizen.marriagesAsPartner1.length === 0 && citizen.marriagesAsPartner2.length === 0 ? (
                                    <div className="text-slate-400 italic text-sm">Aucun acte de mariage enregistré.</div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {/* Marié en tant que partenaire 1 */}
                                        {citizen.marriagesAsPartner1.map((m) => (
                                            <div key={m.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Badge variant="outline">Mariage</Badge>
                                                    <span className="text-xs text-slate-500">{new Date(m.marriageDate).toLocaleDateString("fr-FR")}</span>
                                                </div>
                                                <div className="text-sm">Conjoint: <span className="font-semibold">{m.partner2.firstName} {m.partner2.lastName}</span></div>
                                            </div>
                                        ))}
                                        {/* Marié en tant que partenaire 2 */}
                                        {citizen.marriagesAsPartner2.map((m) => (
                                            <div key={m.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Badge variant="outline">Mariage</Badge>
                                                    <span className="text-xs text-slate-500">{new Date(m.marriageDate).toLocaleDateString("fr-FR")}</span>
                                                </div>
                                                <div className="text-sm">Conjoint: <span className="font-semibold">{m.partner1.firstName} {m.partner1.lastName}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="medical" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2">
                    <Card className="shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Stethoscope className="h-5 w-5 text-slate-500" />
                                Historique Médical
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {citizen.consultations.length > 0 ? (
                                <div className="space-y-4">
                                    {citizen.consultations.map((consultation) => (
                                        <div key={consultation.id} className="group flex flex-col md:flex-row gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
                                            <div className="shrink-0">
                                                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                    <Heart className="h-6 w-6" />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-slate-900">{consultation.diagnosis}</h4>
                                                    <Badge variant="secondary">{new Date(consultation.date).toLocaleDateString("fr-FR")}</Badge>
                                                </div>
                                                <p className="text-sm text-slate-600">Consultation effectuée par Dr. {consultation.doctor.username}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <Heart className="h-6 w-6" />
                                    </div>
                                    <p className="text-slate-500 font-medium">Aucun dossier médical accessible.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="legal" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 gap-6">
                        <Card className="shadow-sm border-red-100">
                            <CardHeader className="bg-red-50/30 border-b border-red-100">
                                <CardTitle className="text-lg font-bold flex items-center gap-2 text-red-900">
                                    <Gavel className="h-5 w-5" />
                                    Casier Judiciaire & Condamnations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {citizen.convictions.length > 0 ? (
                                    <div className="space-y-4">
                                        {citizen.convictions.map((conviction) => (
                                            <div key={conviction.id} className="bg-red-50 border border-red-100 p-4 rounded-lg">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                                    <h4 className="font-bold text-red-800 flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        {conviction.offenseNature}
                                                    </h4>
                                                    <span className="text-xs font-mono text-red-600 bg-red-100 px-2 py-1 rounded">{new Date(conviction.date).toLocaleDateString("fr-FR")}</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <p><span className="font-semibold">Peine:</span> {conviction.sentence}</p>
                                                    <p><span className="font-semibold">Procureur:</span> {conviction.prosecutor.username}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                        <Shield className="h-5 w-5" />
                                        <span className="font-medium">Casier judiciaire vierge. Aucune condamnation enregistrée.</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase text-slate-500">Plaintes Déposées ({citizen.filedComplaints.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {citizen.filedComplaints.length > 0 ? (
                                        <div className="space-y-3">
                                            {citizen.filedComplaints.map((c) => (
                                                <div key={c.id} className="text-sm border-l-2 border-slate-300 pl-3 py-1">
                                                    <p className="font-medium text-slate-900 truncate">{c.description}</p>
                                                    <p className="text-xs text-slate-500">{new Date(c.date).toLocaleDateString("fr-FR")} • Contre: {c.accused ? `${c.accused.firstName} ${c.accused.lastName}` : 'X'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-sm text-slate-400 italic">Aucune donnée</p>}
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase text-slate-500">Plaintes Reçues ({citizen.receivedComplaints.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {citizen.receivedComplaints.length > 0 ? (
                                        <div className="space-y-3">
                                            {citizen.receivedComplaints.map((c) => (
                                                <div key={c.id} className="text-sm border-l-2 border-orange-300 pl-3 py-1 bg-orange-50/50 rounded-r">
                                                    <p className="font-medium text-slate-900 truncate">{c.description}</p>
                                                    <p className="text-xs text-slate-500">{new Date(c.date).toLocaleDateString("fr-FR")} • De: {c.plaintiff ? `${c.plaintiff.firstName} ${c.plaintiff.lastName}` : 'Inconnu'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-sm text-slate-400 italic">Aucune donnée</p>}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="biometric" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <Card className="shadow-sm border-slate-200">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-slate-500" />
                                        Carte d'Identité
                                    </CardTitle>
                                    <CardDescription>Aperçu en temps réel de la carte nationale</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 flex justify-center bg-slate-100/50">
                                    <CitizenCardDisplay
                                        citizen={{
                                            firstName: citizen.firstName,
                                            lastName: citizen.lastName,
                                            nationalityID: citizen.nationalityID,
                                            birthDate: citizen.birthDate,
                                            birthPlace: citizen.birthPlace,
                                            gender: citizen.gender,
                                            maritalStatus: citizen.maritalStatus,
                                            nationality: citizen.nationality,
                                            imagePath: citizen.images.length > 0 ? citizen.images[0].path : undefined,
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="shadow-sm">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Camera className="h-4 w-4" />
                                        Photos Biométriques
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {citizen.images.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {citizen.images.map((image) => (
                                                <div key={image.id} className="aspect-square relative rounded-md overflow-hidden border border-slate-200 shadow-sm cursor-pointer hover:ring-2 ring-primary transition-all">
                                                    <Image
                                                        src={image.path || "/placeholder.svg"}
                                                        alt="Biométrie"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-slate-50 rounded border border-dashed text-slate-400 text-sm">
                                            Aucune photo
                                        </div>
                                    )}
                                    <div className="mt-4">
                                        <ImageUpload citizenId={citizen.id} onUploadComplete={handleImageUpload} maxFiles={5} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}