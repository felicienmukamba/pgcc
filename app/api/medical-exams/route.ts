import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const hasPermission = session.user.roles.some((role) =>
            ["ADMIN", "MEDECIN"].includes(role)
        );

        if (!hasPermission) {
            return NextResponse.json(
                { error: "Permissions insuffisantes" },
                { status: 403 }
            );
        }

        const data = await request.json();

        if (!data.patientId || !data.examType || !data.results) {
            return NextResponse.json(
                { error: "Le patient, le type d'examen et les résultats sont requis." },
                { status: 400 }
            );
        }

        const medicalExam = await prisma.medicalExam.create({
            data: {
                examType: data.examType,
                results: data.results,
                observations: data.observations || null,
                doctorId: session.user.id,
                patientId: data.patientId,
                consultationId: data.consultationId || null,
                date: data.date ? new Date(data.date) : new Date(),
            },
            include: {
                doctor: true,
                patient: true,
                consultation: true,
            },
        });

        return NextResponse.json(medicalExam);
    } catch (error) {
        console.error("Erreur lors de la création de l'examen médical :", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur." },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const medicalExams = await prisma.medicalExam.findMany({
            include: {
                doctor: true,
                patient: true,
                consultation: true,
            },
            orderBy: {
                date: "desc",
            },
        });

        return NextResponse.json(medicalExams);
    } catch (error) {
        console.error("Erreur lors de la récupération des examens médicaux :", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur." },
            { status: 500 }
        );
    }
}
