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

        const medicalExam = await prisma.medicalExam.findUnique({
            where: { id },
            include: {
                patient: true,
                doctor: true,
            },
            // Removed doctorId from include if it causes typing issues, but generally include accepts relation names.
            // Assuming 'doctor' is the relation name in schema.prisma for User model on doctorId.
        });

        if (!medicalExam) {
            return NextResponse.json(
                { error: "Examen médical non trouvé" },
                { status: 404 }
            );
        }

        return NextResponse.json(medicalExam);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'examen médical :", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur." },
            { status: 500 }
        );
    }
}
