import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Check if user has permission to create death records
    const hasPermission = session.user.roles.some((role) => ["ADMIN", "OFFICIER_ETAT_CIVIL"].includes(role))

    if (!hasPermission) {
      return NextResponse.json({ error: "Permissions insuffisantes" }, { status: 403 })
    }

    const data = await request.json()

    const deathRecord = await prisma.deathRecord.create({
      data: {
        citizenId: data.citizenId,
        deathPlace: data.deathPlace,
        deathDate: new Date(data.deathDate),
        declarerId: data.declarerId,
        officiantId: session.user.id,
        informantRelationship: data.informantRelationship,
        funeralPlace: data.funeralPlace || null,
        cemeteryName: data.cemeteryName || null,
      },
      include: {
        citizen: true,
        declarer: true,
        officiant: true,
      },
    })

    return NextResponse.json(deathRecord)
  } catch (error) {
    console.error("Error creating death record:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const deathRecords = await prisma.deathRecord.findMany({
      include: {
        citizen: true,
        declarer: true,
        officiant: true,
      },
      orderBy: {
        deathDate: "desc",
      },
    })

    return NextResponse.json(deathRecords)
  } catch (error) {
    console.error("Error fetching death records:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
