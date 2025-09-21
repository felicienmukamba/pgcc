import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { consultationId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { consultationId } = params;

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

    return NextResponse.json(consultation);
  } catch (error) {
    console.error("Error fetching consultation:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}