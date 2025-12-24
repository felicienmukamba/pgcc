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
            ["ADMIN", "OFFICIER_ETAT_CIVIL"].includes(role)
        );

        if (!hasPermission) {
            return NextResponse.json(
                { error: "Permissions insuffisantes" },
                { status: 403 }
            );
        }

        const data = await request.json();

        if (!data.partner1Id || !data.partner2Id || !data.witness1Id || !data.witness2Id) {
            return NextResponse.json(
                { error: "Toutes les parties (partenaires et témoins) sont requises." },
                { status: 400 }
            );
        }

        const divorceRecord = await prisma.divorceRecord.create({
            data: {
                registrationNumber: data.registrationNumber,
                partner1Id: data.partner1Id,
                partner2Id: data.partner2Id,
                marriageRecordId: data.marriageRecordId || null,
                divorceDate: new Date(data.divorceDate),
                divorcePlace: data.divorcePlace,
                officiantId: session.user.id,
                witness1Id: data.witness1Id,
                witness2Id: data.witness2Id,
                reason: data.reason || null,
                judgementNumber: data.judgementNumber || null,
            },
            include: {
                partner1: true,
                partner2: true,
                officiant: true,
                witness1: true,
                witness2: true,
            },
        });

        return NextResponse.json(divorceRecord);
    } catch (error) {
        console.error("Erreur lors de la création de l'acte de divorce :", error);
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

        const divorceRecords = await prisma.divorceRecord.findMany({
            include: {
                partner1: true,
                partner2: true,
                officiant: true,
                witness1: true,
                witness2: true,
            },
            orderBy: {
                divorceDate: "desc",
            },
        });

        return NextResponse.json(divorceRecords);
    } catch (error) {
        console.error("Erreur lors de la récupération des actes de divorce :", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur." },
            { status: 500 }
        );
    }
}
