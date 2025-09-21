import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;

    const complaint = await prisma.complaint.findUnique({
      where: {
        id: id,
      },
      include: {
        plaintiff: true,
        accused: true,
        policeOfficer: true,
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: "Plainte introuvable" }, { status: 404 });
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const hasPermission = session.user.roles.some((role) => ["ADMIN", "OPJ"].includes(role));

    if (!hasPermission) {
      return NextResponse.json({ error: "Permissions insuffisantes" }, { status: 403 });
    }

    const { id } = params;

    // Check if the complaint exists
    const complaint = await prisma.complaint.findUnique({
      where: {
        id: id,
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: "Plainte introuvable" }, { status: 404 });
    }

    // Delete the complaint
    await prisma.complaint.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: "Plainte supprimée avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
