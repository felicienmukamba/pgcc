import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { recordId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { recordId } = params;

    const marriageRecord = await prisma.marriageRecord.findUnique({
      where: { id: recordId },
      include: {
        partner1: true,
        partner2: true,
        officiant: true,
        witness1: true,
        witness2: true,
        witness3: true,
      },
    });

    if (!marriageRecord) {
      return NextResponse.json({ error: "Acte de mariage non trouvé" }, { status: 404 });
    }

    return NextResponse.json(marriageRecord);
  } catch (error) {
    console.error("Error fetching marriage record:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}