"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button" // Assumed import
import { Label } from "@/components/ui/label" // Assumed import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Assumed import
import { Input } from "@/components/ui/input" // Assumed Input component
import { Textarea } from "@/components/ui/textarea" // Assumed Textarea component
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

// Interfaces pour le modèle de données (simplifiées pour le formulaire)
interface FormState {
  date: string; // Format d'entrée HTML, e.g., 'YYYY-MM-DDTHH:mm'
  diagnosis: string;
  price: number;
  duration: number; // En minutes
  notes: string | null;
}

// Interface pour les données complètes récupérées
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
  prescriptions: any[]; // Garder pour l'affichage si besoin, mais non éditable ici
}

export default function EditConsultationPage() {
  const router = useRouter();
  const params = useParams();
  // Renommer params.id si votre route est [id]
  const consultationId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: session, status } = useSession();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [formData, setFormData] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Vérification de permission
  const isEditingAllowed = session?.user?.roles.includes("MEDECIN");

  const fetchConsultation = useCallback(async () => {
    if (!consultationId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/consultations/${consultationId}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de la consultation.");
      }
      const data: Consultation = await response.json();
      setConsultation(data);

      // Initialisation du formulaire avec les données existantes
      // Le format ISO de la date est converti en format compatible input datetime-local (YYYY-MM-DDTHH:mm)
      const dateForInput = new Date(data.date).toISOString().slice(0, 16);
      
      setFormData({
        date: dateForInput,
        diagnosis: data.diagnosis,
        price: data.price,
        duration: data.duration,
        notes: data.notes,
      });

    } catch (error) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les détails de la consultation. Vérifiez l'ID.",
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

  // Fonction de gestion des changements dans le formulaire
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => {
      if (!prev) return null;
      
      let finalValue: string | number | null = value;
      
      // Conversion des champs numériques
      if (id === 'price' || id === 'duration') {
        finalValue = parseFloat(value) || 0;
      }

      return {
        ...prev,
        [id]: finalValue,
      };
    });
  };

  // Fonction de sauvegarde (PUT API)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !consultationId || isSaving || !isEditingAllowed) return;

    setIsSaving(true);

    try {
      // Préparation des données pour l'API (assurez-vous que la date est un format ISO valide si votre API la reçoit comme telle)
      const dataToSubmit = {
        ...formData,
        // S'assurer que les champs numériques sont bien des nombres
        price: Number(formData.price),
        duration: Number(formData.duration),
      };
      
      const response = await fetch(`/api/consultations/${consultationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        // Tenter de lire le message d'erreur du body si l'API le fournit
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status} lors de la sauvegarde.`);
      }

      toast({
        title: "Succès",
        description: "La consultation a été mise à jour avec succès.",
      });

      // Rediriger vers la page de détails après la sauvegarde
      router.push(`/dashboard/consultations/${consultationId}`);

    } catch (error: any) {
      toast({
        title: "Erreur de sauvegarde",
        description: error.message,
        variant: "destructive",
      });
      console.error("Failed to save consultation:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Chargement des données de consultation...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }
  
  if (!consultation || !formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-800">Consultation introuvable</h2>
        <p className="text-muted-foreground mt-2">Impossible de charger les données pour l'édition.</p>
        <Link href="/dashboard/consultations">
          <Button className="mt-6"><ArrowLeft className="h-4 w-4 mr-2" /> Retour à la liste</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/consultations/${consultationId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Modifier la Consultation</h1>
            <p className="text-muted-foreground">
              Patient: **{consultation.patient.firstName} {consultation.patient.lastName}**
            </p>
          </div>
        </div>
        
        {/* Bouton de sauvegarde */}
        <Button
          onClick={handleSave}
          disabled={isSaving || !isEditingAllowed}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? "Sauvegarde en cours..." : "Sauvegarder les modifications"}
        </Button>
      </div>

      {/* Alerte si l'utilisateur n'a pas la permission */}
      {!isEditingAllowed && (
        <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-md">
            Seul un utilisateur avec le rôle **MEDECIN** peut modifier cette consultation.
        </div>
      )}

      {/* Formulaire d'édition */}
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Détails principaux</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date & Heure de la consultation</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={handleFormChange}
                  disabled={!isEditingAllowed}
                />
              </div>

              {/* Durée */}
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (en minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleFormChange}
                  disabled={!isEditingAllowed}
                  min="5"
                />
              </div>

              {/* Prix */}
              <div className="space-y-2">
                <Label htmlFor="price">Prix (F CFA)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleFormChange}
                  disabled={!isEditingAllowed}
                  min="0"
                />
              </div>

            </div>

            {/* Diagnostic */}
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnostic (obligatoire)</Label>
              <Input
                id="diagnosis"
                value={formData.diagnosis}
                onChange={handleFormChange}
                disabled={!isEditingAllowed}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes/Commentaires</Label>
              {/* Utilisation de Textarea pour un champ multiligne */}
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={handleFormChange}
                disabled={!isEditingAllowed}
                rows={4}
              />
            </div>

          </CardContent>
        </Card>
      </form>
      
      {/* Affichage des Prescriptions (lecture seule pour l'édition) */}
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions Associées (Lecture seule)</CardTitle>
        </CardHeader>
        <CardContent>
          {consultation.prescriptions && consultation.prescriptions.length > 0 ? (
            <ul className="space-y-3">
              {consultation.prescriptions.map((p) => (
                <li key={p.id} className="text-sm bg-muted/50 p-3 rounded-md">
                  **Médicaments:** {p.medications.map((m: any) => m.name).join(', ')} | **Dosage:** {p.dosage}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic">Aucune prescription. Les prescriptions doivent être gérées via une interface dédiée si elles ne sont pas modifiables ici.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
