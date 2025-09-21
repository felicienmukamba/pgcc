// app/dashboard/marriage-records/[id]/page.tsx
"use client"

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Calendar, MapPin, PersonStanding, Users, X } from "lucide-react";
import Link from "next/link";

interface MarriageRecord {
  id: string;
  marriagePlace: string;
  marriageDate: string;
  marriageType: string;
  contractType?: string;
  partner1: {
    firstName: string;
    lastName: string;
    nationalityID: string;
  };
  partner2: {
    firstName: string;
    lastName: string;
    nationalityID: string;
  };
  officiant: {
    username: string;
  };
  witness1?: {
    firstName: string;
    lastName: string;
    nationalityID: string;
  } | null;
  witness2?: {
    firstName: string;
    lastName: string;
    nationalityID: string;
  } | null;
  witness3?: {
    firstName: string;
    lastName: string;
    nationalityID: string;
  } | null;
}

interface MarriageRecordDetailsProps {
  params: {
    id: string;
  };
}

export default function MarriageRecordDetailsPage({ params }: MarriageRecordDetailsProps) {
  const { id } = params;
  const [marriageRecord, setMarriageRecord] = useState<MarriageRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(`/api/marriage-records/${id}`);
        if (!response.ok) {
          notFound();
        }
        const data = await response.json();
        setMarriageRecord(data);
      } catch (error) {
        console.error("Failed to fetch marriage record:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  if (loading) {
    return <div className="text-center p-8">Chargement...</div>;
  }

  if (!marriageRecord) {
    // This case should ideally be handled by notFound(), but as a fallback
    return <div className="text-center p-8">Acte de mariage non trouvé.</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderCitizen = (citizen: any) => {
    if (!citizen) return <span className="text-muted-foreground">N/A</span>;
    return (
      <span className="font-medium">
        {citizen.firstName} {citizen.lastName} ({citizen.nationalityID})
      </span>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/marriage-records">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Détails de l'Acte de Mariage</h1>
          <p className="text-muted-foreground">Numéro d'enregistrement: {marriageRecord.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations principales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Date du mariage</p>
                <p>{formatDate(marriageRecord.marriageDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Lieu du mariage</p>
                <p>{marriageRecord.marriagePlace}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Type de mariage</p>
                <p>{marriageRecord.marriageType}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Type de contrat</p>
                <p>{marriageRecord.contractType || "Non spécifié"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Partenaires et Officier</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Époux</p>
            {renderCitizen(marriageRecord.partner1)}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Épouse</p>
            {renderCitizen(marriageRecord.partner2)}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Officier d'état civil</p>
            <span>{marriageRecord.officiant.username}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Témoins</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Témoin 1</p>
            {renderCitizen(marriageRecord.witness1)}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Témoin 2</p>
            {renderCitizen(marriageRecord.witness2)}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Témoin 3</p>
            {renderCitizen(marriageRecord.witness3)}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Link href={`/dashboard/marriage-records/${id}/generate`}>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Générer le PDF
          </Button>
        </Link>
      </div>
    </div>
  );
}