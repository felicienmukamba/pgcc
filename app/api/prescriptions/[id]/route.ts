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

        const prescription = await prisma.prescription.findUnique({
            where: { id: params.id },
            include: {
                consultation: {
                    include: {
                        patient: true,
                        doctor: true
                    }
                },
                medications: true,
            },
        });

        if (!prescription) {
            return NextResponse.json(
                { error: "Prescription non trouvée" },
                { status: 404 }
            );
        }

        return NextResponse.json(prescription);
    } catch (error) {
        console.error("Erreur lors de la récupération de la prescription :", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur." },
            { status: 500 }
        );
    }
}
