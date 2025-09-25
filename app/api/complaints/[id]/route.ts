import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const complaintId = params.id

    const complaint = await prisma.complaint.findUnique({
      where: {
        id: complaintId,
      },
      include: {
        plaintiff: true,
        accused: true,
        policeOfficer: true,
      },
    })

    if (!complaint) {
      return NextResponse.json({ error: "Plainte non trouvée" }, { status: 404 })
    }

    // Check if user has permission to view this complaint
    const hasPermission = session.user.roles.some((role) =>
      ["ADMIN", "OPJ", "CITOYEN"].includes(role)
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Permissions insuffisantes pour voir cette plainte" },
        { status: 403 }
      )
    }

    return NextResponse.json(complaint)
  } catch (error) {
    console.error("Error fetching complaint details:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
