import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Type de données attendues pour la mise à jour (simplifié)
interface UpdateConsultationData {
  date?: string;
  diagnosis?: string;
  price?: number;
  duration?: string;
  notes?: string | null;
  // Les mises à jour de prescriptions sont plus complexes et sont omises ici pour la simplicité,
  // mais une implémentation réelle devrait gérer la suppression/création des relations.
}

/**
 * GET: Récupérer une consultation spécifique par ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const consultationId = params.id;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        doctor: true,
        patient: true,
        prescriptions: {
          include: {
            medications: true,
          },
        },
      },
    });

    if (!consultation) {
      return NextResponse.json({ error: "Consultation non trouvée" }, { status: 404 });
    }

    // Ici, vous pourriez ajouter une vérification de permission pour le rôle
    // ou si le docteur est bien le médecin traitant, si nécessaire.
    // Par défaut, nous autorisons l'accès si l'utilisateur est connecté.

    return NextResponse.json(consultation);
  } catch (error) {
    console.error("Error fetching consultation by ID:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

/**
 * PUT: Mettre à jour une consultation spécifique par ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const consultationId = params.id;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Seul un médecin peut modifier une consultation
    const hasPermission = session.user.roles.includes("MEDECIN");

    if (!hasPermission) {
      return NextResponse.json({ error: "Permissions insuffisantes - Accès médecin requis" }, { status: 403 });
    }

    const data: UpdateConsultationData = await request.json();

    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        // Conversion des dates et des nombres si elles sont présentes
        date: data.date ? new Date(data.date) : undefined,
        diagnosis: data.diagnosis,
        price: data.price,
        duration: data.duration,
        notes: data.notes, // Gère la mise à jour à null
        // Les autres champs comme patientId ou doctorId ne devraient pas être modifiés ici.
      },
      include: {
        doctor: true,
        patient: true,
        prescriptions: {
          include: {
            medications: true,
          },
        },
      },
    });

    return NextResponse.json(updatedConsultation);
  } catch (error) {
    console.error("Error updating consultation:", error);
    // Vérifier si c'est une erreur "Record to update not found" (P2025)
    // Ici, on retourne juste 500 pour la simplicité, mais on pourrait affiner l'erreur.
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la consultation" }, { status: 500 });
  }
}
