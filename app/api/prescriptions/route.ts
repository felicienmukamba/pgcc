import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !hasPermission(session.user.role, "READ_MEDICAL")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const prescriptions = await prisma.prescription.findMany({
      include: {
        consultation: {
          include: {
            patient: {
              select: { id: true, firstName: true, lastName: true },
            },
            doctor: {
              select: { id: true, name: true },
            },
          },
        },
        prescribedMedications: {
          include: {
            medication: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error("Erreur lors de la récupération des prescriptions:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !hasPermission(session.user.role, "WRITE_MEDICAL")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const data = await request.json()
    const { consultationId, prescribedMedications, generalInstructions } = data

    const prescription = await prisma.prescription.create({
      data: {
        consultationId,
        generalInstructions,
        prescribedMedications: {
          create: prescribedMedications.map((med: any) => ({
            medicationId: med.medicationId,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            instructions: med.instructions,
          })),
        },
      },
      include: {
        prescribedMedications: {
          include: {
            medication: true,
          },
        },
      },
    })

    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la prescription:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
