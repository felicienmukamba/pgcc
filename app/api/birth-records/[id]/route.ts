import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;

    const birthRecord = await prisma.birthRecord.findUnique({
      where: {
        id: id,
      },
      include: {
        citizen: true,
        officiant: true,
        declarer: true,
      },
    });

    if (!birthRecord) {
      return NextResponse.json(
        { error: "Acte de naissance introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json(birthRecord);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'acte de naissance :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
