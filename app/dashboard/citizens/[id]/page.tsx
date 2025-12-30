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
    ArrowLeft, AlertTriangle, Gavel, Stethoscope, Briefcase, Printer, MoreHorizontal,
    Pencil
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

import { CitizenCardDisplay } from "@/components/CitizenCardDisplay";
import { Skeleton } from "@/components/ui/skeleton"

// --- Interfaces ---
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
    <div className={cn("flex flex-col space-y-1.5 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors", className)}>
        <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {label}
        </dt>
        <dd className="text-base font-semibold text-foreground">{value || "—"}</dd>
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
            <div className="space-y-6 max-w-7xl mx-auto pb-10">
                <div className="h-64 rounded-xl bg-muted animate-pulse" />
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 h-96 rounded-xl bg-muted animate-pulse" />
                    <div className="col-span-1 h-96 rounded-xl bg-muted animate-pulse" />
                </div>
            </div>
        )
    }

    if (!citizen) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="p-6 rounded-full bg-slate-100">
                    <User className="h-12 w-12 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold">Citoyen introuvable</h2>
                <Button onClick={() => router.push("/dashboard/citizens")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à l'annuaire
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10">
            {/* HERO Header Section */}
            <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-blue-900 to-indigo-800 relative">
                    <div className="absolute inset-0 bg-[url('/img/noise.png')] opacity-10" />
                    <div className="absolute top-4 left-4">
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => router.push("/dashboard/citizens")}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                        </Button>
                    </div>
                </div>

                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start -mt-12">
                        {/* Avatar / Photo */}
                        <div className="relative flex-shrink-0">
                            <div className="h-32 w-32 rounded-2xl border-4 border-white dark:border-slate-950 shadow-md bg-white overflow-hidden relative">
                                {citizen.images.length > 0 ? (
                                    <Image src={citizen.images[0].path} alt="Profile" fill className="object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                                        <User className="h-12 w-12 text-slate-300" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-2 right-2">
                                {citizen.deathRecord ? (
                                    <Badge variant="destructive" className="border-2 border-white rounded-full h-6 w-6 p-0 flex items-center justify-center" title="Décédé">
                                        <div className="h-2 w-2 rounded-full bg-white" />
                                    </Badge>
                                ) : (
                                    <Badge className="bg-green-500 border-2 border-white rounded-full h-6 w-6 p-0 flex items-center justify-center" title="Actif">
                                        <div className="h-2 w-2 rounded-full bg-white" />
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 pt-0 md:pt-14 space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
                                        {citizen.firstName} {citizen.lastName}
                                        <Badge variant="outline" className="ml-2 font-normal text-xs uppercase tracking-wider border-blue-200 bg-blue-50 text-blue-700">
                                            {citizen.nationalityID}
                                        </Badge>
                                    </h1>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium mt-1">
                                        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {citizen.birthPlace}, {citizen.nationality}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Citoyen</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" className="h-9 gap-2 shadow-sm" onClick={() => window.print()}>
                                        <Printer className="h-4 w-4" />
                                        <span className="hidden sm:inline">Imprimer</span>
                                    </Button>
                                    <Button size="sm" className="h-9 gap-2 shadow-sm">
                                        <Pencil className="h-4 w-4" />
                                        <span className="hidden sm:inline">Modifier</span>
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-9 w-9">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABBED Content */}
            <Tabs defaultValue="personal" className="space-y-6">
                <TabsList className="w-full justify-start overflow-x-auto h-auto p-1.5 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-md rounded-xl space-x-1 border border-slate-200/60 sticky top-4 z-20 shadow-sm">
                    <TabsTrigger value="personal" className="rounded-lg px-4 py-2 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">Identité & Contact</TabsTrigger>
                    <TabsTrigger value="civil" className="rounded-lg px-4 py-2 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">État Civil</TabsTrigger>
                    <TabsTrigger value="medical" className="rounded-lg px-4 py-2 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">Santé</TabsTrigger>
                    <TabsTrigger value="legal" className="rounded-lg px-4 py-2 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">Juridique</TabsTrigger>
                    <TabsTrigger value="biometric" className="rounded-lg px-4 py-2 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">Biométrie</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2 shadow-sm border-slate-200/60 bg-white/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <User className="h-5 w-5 text-primary" />
                                    Informations Personnelles
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <DetailRow label="Prénom" value={citizen.firstName} />
                                <DetailRow label="Nom" value={citizen.lastName} />
                                <DetailRow label="Sexe" value={citizen.gender} />
                                <DetailRow label="Date de naissance" value={new Date(citizen.birthDate).toLocaleDateString("fr-FR")} icon={Calendar} />
                                <DetailRow label="Lieu de naissance" value={citizen.birthPlace} icon={MapPin} />
                                <DetailRow label="Nationalité" value={citizen.nationality} />
                                <DetailRow label="Nom de jeune fille" value={citizen.maidenName} className="col-span-2 md:col-span-3" />
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-slate-200/60 bg-white/50 backdrop-blur-sm h-fit">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Phone className="h-5 w-5 text-primary" />
                                    Contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <DetailRow label="Résidence" value={citizen.currentAddress} icon={MapPin} />
                                <DetailRow label="Téléphone" value={citizen.phoneNumber} icon={Phone} />
                                <DetailRow label="Email" value={citizen.user.email} icon={Mail} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="civil" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2">
                    <Card className="shadow-sm border-slate-200/60 bg-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5 text-primary" />
                                Documents d'État Civil
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Naissance */}
                            <div className="relative pl-6 border-l-2 border-slate-200">
                                <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-slate-200 border-2 border-white" />
                                <h3 className="text-sm font-bold uppercase text-slate-500 mb-4">Acte de Naissance</h3>
                                {citizen.birthRecordChild ? (
                                    <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <DetailRow label="Numéro d'acte" value={citizen.birthRecordChild.registrationNumber} />
                                        <DetailRow label="Date d'enregistrement" value={new Date(citizen.birthRecordChild.date).toLocaleDateString("fr-FR")} />
                                        <DetailRow label="Lieu" value={citizen.birthRecordChild.place} />
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic text-sm">Non disponible.</p>
                                )}
                            </div>

                            {/* Mariages */}
                            <div className="relative pl-6 border-l-2 border-slate-200">
                                <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-slate-200 border-2 border-white" />
                                <h3 className="text-sm font-bold uppercase text-slate-500 mb-4">Mariages</h3>
                                {citizen.marriagesAsPartner1.length === 0 && citizen.marriagesAsPartner2.length === 0 ? (
                                    <p className="text-muted-foreground italic text-sm">Célibataire / Aucun acte.</p>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {[...citizen.marriagesAsPartner1, ...citizen.marriagesAsPartner2].map((m) => (
                                            <div key={m.id} className="bg-pink-50/50 p-4 rounded-lg border border-pink-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Badge variant="outline" className="bg-white hover:bg-white text-pink-600 border-pink-200">Mariage</Badge>
                                                    <span className="text-xs text-pink-600/80 font-medium">{new Date(m.marriageDate).toLocaleDateString("fr-FR")}</span>
                                                </div>
                                                <div className="text-sm mt-2">
                                                    Partenaire: <span className="font-bold text-slate-800">
                                                        {citizen.marriagesAsPartner1.some(mp => mp.id === m.id) ? `${m.partner2.firstName} ${m.partner2.lastName}` : `${m.partner1.firstName} ${m.partner1.lastName}`}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="medical" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2">
                    <Card className="shadow-sm border-slate-200/60 bg-white/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Stethoscope className="h-5 w-5 text-primary" />
                                Dossier Médical
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {citizen.consultations.length > 0 ? (
                                <div className="space-y-4">
                                    {citizen.consultations.map((consultation) => (
                                        <div key={consultation.id} className="group relative flex gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all">
                                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                                <span className="text-lg font-bold">{new Date(consultation.date).getDate()}</span>
                                                <span className="text-xs uppercase font-medium">{new Date(consultation.date).toLocaleString('default', { month: 'short' })}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-900 text-lg">{consultation.diagnosis}</h4>
                                                <p className="text-sm text-slate-500">Dr. {consultation.doctor.username}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-slate-100 mb-4">
                                        <Heart className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 font-medium">Aucune historique médicale.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="legal" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 gap-6">
                        <Card className="shadow-sm border-red-100 bg-red-50/20 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg text-red-900">
                                    <Gavel className="h-5 w-5" />
                                    Casier Judiciaire
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {citizen.convictions.length > 0 ? (
                                    <div className="space-y-4">
                                        {citizen.convictions.map((conviction) => (
                                            <div key={conviction.id} className="bg-white border border-red-100 p-5 rounded-lg shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-red-800 flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        {conviction.offenseNature}
                                                    </h4>
                                                    <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">{new Date(conviction.date).toLocaleDateString("fr-FR")}</Badge>
                                                </div>
                                                <p className="text-sm text-slate-700 mt-2"><span className="font-semibold">Peine:</span> {conviction.sentence}</p>
                                                <p className="text-xs text-slate-500 mt-1">Procureur: {conviction.prosecutor.username}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-emerald-600">
                                        <Shield className="h-12 w-12 mb-3 opacity-20" />
                                        <span className="font-medium text-lg">Casier judiciaire vierge</span>
                                        <span className="text-sm opacity-80">Aucune condamnation enregistrée</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="biometric" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <Card className="shadow-sm border-slate-200/60 bg-white/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle>Carte d'Identité</CardTitle>
                                    <CardDescription>Aperçu numérique officiel</CardDescription>
                                </CardHeader>
                                <CardContent className="flex justify-center py-8">
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
                        <div>
                            <Card className="shadow-sm border-slate-200/60 bg-white/50 backdrop-blur-sm h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Camera className="h-4 w-4" />
                                        Photos Biométriques
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {citizen.images.map((image) => (
                                            <div key={image.id} className="aspect-square relative rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                                <Image src={image.path} alt="Bio" fill className="object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <ImageUpload citizenId={citizen.id} onUploadComplete={handleImageUpload} maxFiles={5} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}