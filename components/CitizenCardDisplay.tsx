"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Eye } from "lucide-react";

// Import dynamique des composants React-PDF qui ne supportent pas le SSR
const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    { ssr: false }
);

const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
    { ssr: false }
);

// Importer le composant de la carte (assurez-vous que le chemin est correct)
// Si CitizenCardPDF est dans le même fichier ou dans un fichier séparé
// Supposons qu'il est dans un fichier 'CitizenCardPDF' pour cet exemple.
import { CitizenCardPDF } from "./CitizenCardPDF"; // Assurez-vous que le chemin est correct

// Interface de données simplifiée pour la carte
interface CitizenCardData {
    firstName: string;
    lastName: string;
    nationalityID: string;
    birthDate: string;
    birthPlace: string;
    gender: string;
    maritalStatus: string;
    imagePath?: string;
    nationality: string;
}

interface CitizenCardDisplayProps {
    citizen: CitizenCardData;
}

export const CitizenCardDisplay: React.FC<CitizenCardDisplayProps> = ({ citizen }) => {
    const [isClient, setIsClient] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // S'assurer qu'on est côté client avant d'afficher les boutons React-PDF
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="flex items-center justify-center p-8 border rounded-lg bg-gray-50">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement de la carte...
            </div>
        );
    }

    const fileName = `Carte_Citoyen_${citizen.lastName}_${citizen.firstName}.pdf`;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">Générateur de Carte d'Identité RDC</h3>

            <div className="flex gap-4">
                {/* Bouton de Téléchargement */}
                <PDFDownloadLink
                    document={<CitizenCardPDF citizen={citizen} />}
                    fileName={fileName}
                >
                    {({ loading }) => (
                        <Button disabled={loading}>
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            {loading ? "Génération..." : "Télécharger la Carte (PDF)"}
                        </Button>
                    )}
                </PDFDownloadLink>
                
                {/* Bouton d'Aperçu */}
                <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                    <Eye className="mr-2 h-4 w-4" />
                    {showPreview ? "Cacher l'Aperçu" : "Afficher l'Aperçu"}
                </Button>
            </div>

            {/* Aperçu de la Carte */}
            {showPreview && (
                <div className="w-full h-[400px] border rounded-lg overflow-hidden mt-4">
                    <PDFViewer width="100%" height="100%">
                        <CitizenCardPDF citizen={citizen} />
                    </PDFViewer>
                </div>
            )}
        </div>
    );
};