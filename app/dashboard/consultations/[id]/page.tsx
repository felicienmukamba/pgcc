"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"
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
  duration: number;
  notes: string | null;
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  prescriptions: Prescription[];
}

export default function ConsultationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { consultationId } = params;
  const { data: session, status } = useSession();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // S'assure que l'ID de la consultation est disponible avant de faire la requête
    if (!consultationId || typeof consultationId !== 'string') {
      setLoading(false);
      return;
    }

    const fetchConsultation = async () => {
      try {
        // Appelle l'endpoint d'API pour une seule consultation (corrigé)
        const response = await fetch(`/api/consultations/${consultationId}`);
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
    };
    fetchConsultation();
  }, [consultationId]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Chargement en cours...</p>
      </div>
    );
  }
  
  // Gère le cas où l'utilisateur n'est pas authentifié
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (!consultation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Consultation introuvable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/consultations">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Détails de la Consultation</h1>
          <p className="text-muted-foreground">Informations complètes sur la consultation.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la Consultation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Date</Label>
              <p className="font-medium">{new Date(consultation.date).toLocaleDateString()}</p>
            </div>
            <div className="space-y-2">
              <Label>Durée</Label>
              <p className="font-medium">{consultation.duration} minutes</p>
            </div>
            <div className="space-y-2">
              <Label>Prix</Label>
              <p className="font-medium">{consultation.price} F CFA</p>
            </div>
            <div className="space-y-2">
              <Label>Diagnostic</Label>
              <p className="font-medium">{consultation.diagnosis}</p>
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>Notes</Label>
              <p className="font-medium">{consultation.notes || "Aucune note."}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div className="space-y-2">
              <Label>Médecin</Label>
              <p className="font-medium">{consultation.doctor.firstName} {consultation.doctor.lastName}</p>
            </div>
            <div className="space-y-2">
              <Label>Patient</Label>
              <p className="font-medium">{consultation.patient.firstName} {consultation.patient.lastName}</p>
            </div>
          </div>

          {consultation.prescriptions && consultation.prescriptions.length > 0 && (
            <div className="pt-4 border-t space-y-4">
              <h2 className="text-lg font-semibold">Prescriptions</h2>
              {consultation.prescriptions.map((prescription) => (
                <Card key={prescription.id} className="p-4 bg-muted/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <Label>Posologie</Label>
                      <p className="text-sm font-medium">{prescription.dosage}</p>
                    </div>
                    <div className="space-y-1">
                      <Label>Durée</Label>
                      <p className="text-sm font-medium">{prescription.duration}</p>
                    </div>
                    <div className="space-y-1">
                      <Label>Quantité</Label>
                      <p className="text-sm font-medium">{prescription.quantity}</p>
                    </div>
                    <div className="space-y-1">
                      <Label>Statut</Label>
                      <p className="text-sm font-medium">{prescription.status}</p>
                    </div>
                    <div className="space-y-1 col-span-full">
                      <Label>Médicaments</Label>
                      <ul className="list-disc pl-5 text-sm">
                        {prescription.medications.map((medication) => (
                          <li key={medication.id}>{medication.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
