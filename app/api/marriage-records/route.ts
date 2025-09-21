import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    let citizens;
    if (query) {
      // Filtrer les citoyens si un paramètre de requête est fourni
      citizens = await prisma.citizen.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { nationalityID: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          nationalityID: true,
        },
      });
    } else {
      // Si aucune requête, retourner une liste vide ou un nombre limité
      return NextResponse.json([]);
    }

    return NextResponse.json(citizens);
  } catch (error) {
    console.error("Error fetching citizens:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}