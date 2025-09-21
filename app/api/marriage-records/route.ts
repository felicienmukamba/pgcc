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

    // Check if user has permission to create marriage records
    const hasPermission = session.user.roles.some((role) => ["ADMIN", "OFFICIER_ETAT_CIVIL"].includes(role))

    if (!hasPermission) {
      return NextResponse.json({ error: "Permissions insuffisantes" }, { status: 403 })
    }

    const data = await request.json()

    const marriageRecord = await prisma.marriageRecord.create({
      data: {
        partner1Id: data.partner1Id,
        partner2Id: data.partner2Id,
        marriagePlace: data.marriagePlace,
        marriageDate: new Date(data.marriageDate),
        officiantId: session.user.id,
        witness1Id: data.witness1Id,
        witness2Id: data.witness2Id,
        witness3Id: data.witness3Id || null,
        marriageType: data.marriageType,
        contractType: data.contractType || null,
      },
      include: {
        partner1: true,
        partner2: true,
        officiant: true,
        witness1: true,
        witness2: true,
        witness3: true,
      },
    })

    return NextResponse.json(marriageRecord)
  } catch (error) {
    console.error("Error creating marriage record:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const marriageRecords = await prisma.marriageRecord.findMany({
      include: {
        partner1: true,
        partner2: true,
        officiant: true,
        witness1: true,
        witness2: true,
        witness3: true,
      },
      orderBy: {
        marriageDate: "desc",
      },
    })

    return NextResponse.json(marriageRecords)
  } catch (error) {
    console.error("Error fetching marriage records:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
