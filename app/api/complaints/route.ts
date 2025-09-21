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

    // Check if user can create complaints
    const hasPermission = session.user.roles.some((role) => ["ADMIN", "OPJ", "CITOYEN"].includes(role))

    if (!hasPermission) {
      return NextResponse.json({ error: "Permissions insuffisantes" }, { status: 403 })
    }

    const data = await request.json()

    const complaint = await prisma.complaint.create({
      data: {
        plaintiffId: data.plaintiffId,
        accusedId: data.accusedId || null,
        date: new Date(data.date),
        description: data.description,
        place: data.place,
        type: data.type,
        witnesses: data.witnesses || null,
        evidence: data.evidence || null,
        policeOfficerId: data.policeOfficerId,
        status: "PENDING",
      },
      include: {
        plaintiff: true,
        accused: true,
        policeOfficer: true,
      },
    })

    return NextResponse.json(complaint)
  } catch (error) {
    console.error("Error creating complaint:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const complaints = await prisma.complaint.findMany({
      include: {
        plaintiff: true,
        accused: true,
        policeOfficer: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(complaints)
  } catch (error) {
    console.error("Error fetching complaints:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
