"use client"

import { useState } from "react"
import { FaceCapture } from "./face-capture"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, CheckCircle, XCircle, Calendar, MapPin, Phone, Mail, Heart, FileText, Camera } from "lucide-react"

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
    father?: { firstName: string, lastName: string };
    mother?: { firstName: string, lastName: string };
}


interface CitizenMatch {
    citizenId: string;
    confidence: number;
    citizen: {
        id: string;
        firstName: string;
        lastName: string;
        nationalityID: string;
        birthDate: string;
    };
}

interface FaceRecognitionProps {
    onMatch?: (matches: CitizenMatch[]) => void;
    onError?: (error: string) => void;
}

export function FaceRecognition({ onMatch, onError }: FaceRecognitionProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [matches, setMatches] = useState<CitizenMatch[]>([]);
    const [error, setError] = useState("");
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [matchedCitizen, setMatchedCitizen] = useState<Citizen | null>(null);

    const fetchCitizenDetails = async (citizenId: string) => {
        try {
            const response = await fetch(`/api/citizens/${citizenId}`);
            if (!response.ok) {
                throw new Error("Impossible de récupérer les détails du citoyen.");
            }
            const data = await response.json();
            setMatchedCitizen(data);
        } catch (err: any) {
            const errorMessage = err.message || "Erreur lors de la récupération des détails du citoyen.";
            setError(errorMessage);
            onError?.(errorMessage);
        }
    };

    const handleCapture = async (imageData: string) => {
        setCapturedImage(imageData);
        setIsProcessing(true);
        setError("");
        setMatches([]);
        setMatchedCitizen(null);

        try {
            const response = await fetch("/api/biometric/recognize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: imageData }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const result = await response.json();
            setMatches(result.matches || []);
            onMatch?.(result.matches || []);

            // Si une correspondance est trouvée, récupérer les détails du citoyen
            if (result.matches && result.matches.length > 0) {
                await fetchCitizenDetails(result.matches[0].citizenId);
            }
        } catch (err: any) {
            const errorMessage = err.message || "Erreur lors de la reconnaissance faciale";
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setCapturedImage(null);
        setMatches([]);
        setError("");
        setIsProcessing(false);
        setMatchedCitizen(null);
    };

    const getConfidenceColor = (c: number) =>
        c >= 0.8
            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
            : c >= 0.6
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";

    const getConfidenceIcon = (c: number) =>
        c >= 0.6 ? (
            <CheckCircle className={`h-4 w-4 ${c >= 0.8 ? "text-green-600" : "text-yellow-600"}`} />
        ) : (
            <XCircle className="h-4 w-4 text-red-600" />
        );

    return (
        <div className="space-y-6">
            {!capturedImage && (
                <FaceCapture
                    onCapture={handleCapture}
                    onError={(err) => setError(err)}
                    title="Reconnaissance faciale"
                    description="Capturez une image pour identifier un citoyen dans la base de données"
                />
            )}

            {isProcessing && (
                <Card>
                    <CardContent className="p-6 flex items-center justify-center space-x-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Analyse de l'image en cours...</span>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {matchedCitizen && !isProcessing && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Citoyen identifié
                            </CardTitle>
                            <CardDescription>
                                Un citoyen a été identifié avec succès dans la base de données.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            {matchedCitizen.firstName} {matchedCitizen.lastName}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">ID: {matchedCitizen.nationalityID}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {getConfidenceIcon(matches[0]?.confidence || 0)}
                                    <Badge className={getConfidenceColor(matches[0]?.confidence || 0)}>
                                        {Math.round((matches[0]?.confidence || 0) * 100)}%
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Détails du citoyen</CardTitle>
                            <CardDescription>Informations complètes du dossier du citoyen.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Informations Personnelles */}
                            <div>
                                <h4 className="flex items-center gap-2 text-lg font-semibold mb-2">
                                    <User className="h-5 w-5" />
                                    Personnel
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Nom complet</p>
                                        <p className="font-medium">{matchedCitizen.firstName} {matchedCitizen.lastName}</p>
                                    </div>
                                    {matchedCitizen.maidenName && (
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Nom de jeune fille</p>
                                            <p className="font-medium">{matchedCitizen.maidenName}</p>
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">ID Nationalité</p>
                                        <p className="font-medium">{matchedCitizen.nationalityID}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Date de naissance</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(matchedCitizen.birthDate).toLocaleDateString("fr-FR")}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Lieu de naissance</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {matchedCitizen.birthPlace}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Nationalité</p>
                                        <p className="font-medium">{matchedCitizen.nationality}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Genre</p>
                                        <p className="font-medium">{matchedCitizen.gender}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">État Civil</p>
                                        <p className="font-medium">{matchedCitizen.maritalStatus}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Infos Supplémentaires */}
                            <hr />
                            <div>
                                <h4 className="flex items-center gap-2 text-lg font-semibold mb-2">
                                    <Phone className="h-5 w-5" />
                                    Contact & Supplémentaire
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Adresse</p>
                                        <p className="font-medium">{matchedCitizen.currentAddress}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Téléphone</p>
                                        <p className="font-medium">{matchedCitizen.phoneNumber || "Non renseigné"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{matchedCitizen.user.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Groupe sanguin</p>
                                        <p className="font-medium">{matchedCitizen.bloodType || "Non renseigné"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Images Biométriques */}
                            <hr />
                            <div>
                                <h4 className="flex items-center gap-2 text-lg font-semibold mb-2">
                                    <Camera className="h-5 w-5" />
                                    Photos Biométriques
                                </h4>
                                {matchedCitizen.images.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {matchedCitizen.images.map((image) => (
                                            <div key={image.id} className="aspect-square relative rounded-lg overflow-hidden border">
                                                <img src={image.path} alt="Photo du citoyen" className="object-cover" style={{ width: '100%', height: '100%' }} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Aucune photo enregistrée.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-center mt-4">
                        <Button onClick={reset} variant="outline">
                            Effectuer une nouvelle reconnaissance
                        </Button>
                    </div>
                </>
            )}

            {capturedImage && !isProcessing && !matchedCitizen && !error && (
                <Card>
                    <CardContent className="p-6 text-center">
                        <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Aucune correspondance trouvée</h3>
                        <p className="text-muted-foreground mb-4">
                            Aucun citoyen correspondant n'a été trouvé dans la base biométrique.
                        </p>
                        <Button onClick={reset} variant="outline">
                            Essayer à nouveau
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}