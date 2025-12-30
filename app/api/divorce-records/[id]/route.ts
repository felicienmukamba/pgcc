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

        const divorceRecord = await prisma.divorceRecord.findUnique({
            where: { id: params.id },
            include: {
                partner1: true,
                partner2: true,
                officiant: true,
                witness1: true,
                witness2: true,
            },
        });

        if (!divorceRecord) {
            return NextResponse.json(
                { error: "Acte de divorce non trouvé" },
                { status: 404 }
            );
        }

        return NextResponse.json(divorceRecord);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'acte de divorce :", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur." },
            { status: 500 }
        );
    }
}
