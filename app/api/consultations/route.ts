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

    // Check if user is a doctor
    const hasPermission = session.user.roles.includes("MEDECIN")

    if (!hasPermission) {
      return NextResponse.json({ error: "Permissions insuffisantes - Accès médecin requis" }, { status: 403 })
    }

    const data = await request.json()

    // Create consultation with prescriptions
    const consultation = await prisma.consultation.create({
      data: {
        date: new Date(data.date),
        diagnosis: data.diagnosis,
        price: data.price,
        duration: data.duration,
        notes: data.notes || null,
        doctorId: session.user.id,
        patientId: data.patientId,
        prescriptions: {
          create:
            data.prescriptions?.map((prescription: any) => ({
              date: new Date(data.date),
              dosage: prescription.dosage,
              duration: prescription.duration,
              quantity: prescription.quantity,
              status: prescription.status,
              medications: {
                connect: prescription.medications.map((medId: string) => ({ id: medId })),
              },
            })) || [],
        },
      },
      include: {
        doctor: true,
        patient: true,
        prescriptions: {
          include: {
            medications: true,
          },
        },
      },
    })

    return NextResponse.json(consultation)
  } catch (error) {
    console.error("Error creating consultation:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const consultations = await prisma.consultation.findMany({
      include: {
        doctor: true,
        patient: true,
        prescriptions: {
          include: {
            medications: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(consultations)
  } catch (error) {
    console.error("Error fetching consultations:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
