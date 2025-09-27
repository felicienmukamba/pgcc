"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button" // Assumed import
import { Label } from "@/components/ui/label" // Assumed import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Assumed import
import { Badge } from "@/components/ui/badge" // Assumed import
import { ArrowLeft, Pencil, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast" // Assumed toast hook
import Link from "next/link"

// Interfaces pour le modèle de données
interface Medication {
  id: string;
  name: string;
}

interface Prescription {
  id: string;
  dosage: string;
  duration: string;
  quantity: number;
  status: string;
  medications: Medication[];
}

interface Consultation {
  id: string;
  date: string;
  diagnosis: string;
  price: number;
  duration: number; // En minutes
  notes: string | null;
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    // Ajout d'un champ pour afficher le rôle
    roles?: string[]; 
  };
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  prescriptions: Prescription[];
}

// Composant principal de la page
export default function ConsultationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  
  // Assure que l'ID est bien une chaîne de caractères (pour les routes Next.js dynamiques)
  const consultationId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { data: session, status } = useSession();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérification de permission pour l'édition (MEDECIN)
  const canEdit = session?.user?.roles.includes("MEDECIN");

  const fetchConsultation = useCallback(async () => {
    if (!consultationId || typeof consultationId !== 'string') {
      setLoading(false);
      return;
    }

    try {
      // Appelle l'endpoint d'API pour une seule consultation
      const response = await fetch(`/api/consultations/${consultationId}`);
      
      if (response.status === 404) {
        setConsultation(null); // Consultation non trouvée
        return;
      }
      
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de la consultation.");
      }
      
      const data = await response.json();
      setConsultation(data);

    } catch (error) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les détails de la consultation.",
        variant: "destructive",
      });
      console.error("Failed to fetch consultation:", error);
    } finally {
      setLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    if (status !== "loading") {
        fetchConsultation();
    }
  }, [status, fetchConsultation]);

  // --- États de chargement et d'erreur ---

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Chargement des données de consultation...</p>
      </div>
    );
  }
  
  // Gère le cas où l'utilisateur n'est pas authentifié
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  // Gère le cas où la consultation n'est pas trouvée
  if (!consultation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-800">Consultation introuvable (ID: {consultationId})</h2>
        <p className="text-muted-foreground mt-2">Veuillez vérifier l'identifiant fourni.</p>
        <Link href="/dashboard/consultations">
          <Button className="mt-6">
             <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la liste
          </Button>
        </Link>
      </div>
    );
  }

  // --- Affichage des détails ---

  const formattedDate = new Date(consultation.date).toLocaleDateString("fr-FR", {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton de retour et d'édition */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/consultations">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Dossier de Consultation</h1>
            <p className="text-muted-foreground">ID: {consultation.id}</p>
          </div>
        </div>

        {/* Bouton d'édition (visible uniquement pour les médecins) */}
        {canEdit && (
            <Link href={`/dashboard/consultations/${consultationId}/edit`}>
              <Button variant="default" className="bg-orange-500 hover:bg-orange-600">
                <Pencil className="h-4 w-4 mr-2" />
                Modifier le dossier
              </Button>
            </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la Consultation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Section Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b">
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Date & Heure</Label>
              <p className="font-semibold text-lg">{formattedDate}</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Durée</Label>
              <p className="font-medium text-lg">{consultation.duration} minutes</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Prix Facturé</Label>
              <p className="font-medium text-lg text-green-600">{consultation.price.toFixed(2)} FC</p>
            </div>

             <div className="space-y-2">
              <Label className="text-muted-foreground">Médecin Traitant</Label>
              <p className="font-medium text-lg">Dr. {consultation.doctor.firstName} {consultation.doctor.lastName}</p>
            </div>
          </div>

          {/* Section Patient et Diagnostic */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-1 space-y-2">
              <Label className="text-muted-foreground">Patient Concerné</Label>
              <p className="font-bold text-xl">{consultation.patient.firstName} {consultation.patient.lastName}</p>
              <Badge variant="secondary">ID: {consultation.patient.id}</Badge>
            </div>
            
            <div className="lg:col-span-2 space-y-2">
              <Label className="text-muted-foreground">Diagnostic Principal</Label>
              <p className="text-lg font-semibold bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                {consultation.diagnosis}
              </p>
            </div>
          </div>
          
          {/* Notes */}
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-muted-foreground">Notes du Médecin</Label>
            <p className="italic text-gray-700 p-3 bg-gray-50 rounded-lg">
              {consultation.notes || "Aucune note additionnelle n'a été enregistrée pour cette consultation."}
            </p>
          </div>

        </CardContent>
      </Card>

      {/* Section Prescriptions */}
      {consultation.prescriptions && consultation.prescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prescriptions Associées ({consultation.prescriptions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {consultation.prescriptions.map((prescription) => (
              <Card key={prescription.id} className="p-4 border-l-4 border-indigo-400 bg-indigo-50/50 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Médicaments</Label>
                    <p className="font-semibold text-indigo-700">
                      {prescription.medications.map((medication) => medication.name).join(' / ')}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Posologie</Label>
                    <p className="text-sm font-medium">{prescription.dosage}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Durée</Label>
                    <p className="text-sm font-medium">{prescription.duration}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Statut</Label>
                    <Badge variant="outline" className="text-xs">{prescription.status}</Badge>
                  </div>

                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
