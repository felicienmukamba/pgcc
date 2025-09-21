"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Citizen {
  id: string;
  firstName: string;
  lastName: string;
  nationalityID: string;
}

interface User {
  id: string;
  name: string;
}

interface Complaint {
  id: string;
  plaintiff: Citizen;
  accused: Citizen | null;
  date: string;
  description: string;
  place: string;
  type: string;
  witnesses: string | null;
  evidence: string | null;
  policeOfficer: User;
  status: string;
}

export default function ComplaintPage() {
  const router = useRouter();
  const { complaintId } = useParams();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await fetch(`/api/complaints/${complaintId}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de la plainte");
        }
        const data = await response.json();
        setComplaint(data);
      } catch (err) {
        setError("Plainte introuvable.");
        console.error("Failed to fetch complaint:", err);
      } finally {
        setLoading(false);
      }
    };
    if (complaintId) {
      fetchComplaint();
    }
  }, [complaintId]);

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette plainte ?")) {
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Plainte supprimée avec succès",
        });
        router.push("/dashboard/complaints");
      } else {
        throw new Error("Échec de la suppression");
      }
    } catch (err) {
      console.error("Failed to delete complaint:", err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la plainte.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Chargement des détails de la plainte...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/complaints">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gov-primary">Détails de la plainte</h1>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!complaint) {
    return null; // Should not happen with the error check, but good practice
  }

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    CLOSED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/complaints">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gov-primary">Détails de la plainte</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plainte #{complaint.id.substring(0, 8)}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Suppression..." : "Supprimer"}
              </Button>
            </div>
          </div>
          <CardDescription>
            Enregistrée le {new Date(complaint.date).toLocaleDateString("fr-FR")} à{" "}
            {new Date(complaint.date).toLocaleTimeString("fr-FR")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Parties impliquées</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Plainte déposée par :</p>
                <p className="font-medium">{complaint.plaintiff.firstName} {complaint.plaintiff.lastName}</p>
                <p className="text-xs text-muted-foreground">ID National: {complaint.plaintiff.nationalityID}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accusé :</p>
                {complaint.accused ? (
                  <>
                    <p className="font-medium">{complaint.accused.firstName} {complaint.accused.lastName}</p>
                    <p className="text-xs text-muted-foreground">ID National: {complaint.accused.nationalityID}</p>
                  </>
                ) : (
                  <p className="font-medium italic">Non spécifié</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Détails de l'incident</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Lieu :</p>
                <p className="font-medium">{complaint.place}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type de plainte :</p>
                <p className="font-medium">{complaint.type}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description :</p>
              <p className="font-medium">{complaint.description}</p>
            </div>
            {complaint.witnesses && (
              <div>
                <p className="text-sm text-muted-foreground">Témoins :</p>
                <p className="font-medium">{complaint.witnesses}</p>
              </div>
            )}
            {complaint.evidence && (
              <div>
                <p className="text-sm text-muted-foreground">Preuves :</p>
                <p className="font-medium">{complaint.evidence}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Informations administratives</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Enregistrée par :</p>
                <p className="font-medium">{complaint.policeOfficer.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut :</p>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                    statusColors[complaint.status as keyof typeof statusColors]
                  }`}
                >
                  {complaint.status}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
