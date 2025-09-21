import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Vérification de l'authentification
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérification des permissions
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

    // Validation des données
    if (!data.citizenId || !data.declarerId) {
      return NextResponse.json(
        { error: "L'ID du Citoyen et l'ID du Déclarant sont requis." },
        { status: 400 }
      );
    }

    // Le déclarant ne peut pas être le même que l'enfant
    if (data.citizenId === data.declarerId) {
      return NextResponse.json(
        {
          error:
            "Le déclarant ne peut pas être la même personne que l'enfant de l'acte de naissance.",
        },
        { status: 400 }
      );
    }

    // Création de l'acte de naissance dans la base de données
    const birthRecord = await prisma.birthRecord.create({
      data: {
        registrationNumber: data.registrationNumber,
        citizenId: data.citizenId,
        officiantId: session.user.id, // L'utilisateur connecté est l'officier d'état civil
        declarerId: data.declarerId,
        date: new Date(data.registrationDate),
        place: data.birthPlace,
        childName: data.childName,
        gender: data.gender,
        birthDate: new Date(data.birthDate),
        birthPlace: data.birthPlace,
        weight: parseFloat(data.weight),
        height: parseFloat(data.height),
        birthTime: data.birthTime,
      },
      include: {
        citizen: true,
        officiant: true,
        declarer: true,
      },
    });

    return NextResponse.json(birthRecord);
  } catch (error) {
    console.error("Erreur lors de la création de l'acte de naissance :", error);
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

    // Récupération de tous les actes de naissance avec les informations de leurs relations
    const birthRecords = await prisma.birthRecord.findMany({
      include: {
        citizen: true,
        officiant: true,
        declarer: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(birthRecords);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des actes de naissance :",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}