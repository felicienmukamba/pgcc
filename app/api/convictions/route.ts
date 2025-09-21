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

    // Check if user has permission to create convictions
    const hasPermission = session.user.roles.some((role) => ["ADMIN", "PROCUREUR"].includes(role))

    if (!hasPermission) {
      return NextResponse.json({ error: "Permissions insuffisantes" }, { status: 403 })
    }

    const data = await request.json()

    const conviction = await prisma.conviction.create({
      data: {
        date: new Date(data.date),
        jurisdiction: data.jurisdiction,
        court: data.court,
        offenseNature: data.offenseNature,
        duration: data.duration || null,
        fineAmount: data.fineAmount || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status,
        sentence: data.sentence,
        sentenceType: data.sentenceType,
        paroleStatus: data.paroleStatus || null,
        rehabilitationStatus: data.rehabilitationStatus || null,
        appealStatus: data.appealStatus || "NONE",
        citizenId: data.citizenId,
        prosecutorId: session.user.id,
      },
      include: {
        citizen: true,
        prosecutor: true,
      },
    })

    return NextResponse.json(conviction)
  } catch (error) {
    console.error("Error creating conviction:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const convictions = await prisma.conviction.findMany({
      include: {
        citizen: true,
        prosecutor: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(convictions)
  } catch (error) {
    console.error("Error fetching convictions:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
