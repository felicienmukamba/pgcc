import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const citizen = await prisma.citizen.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            email: true,
            username: true,
          },
        },
        images: true,
        birthRecordChild: true,
        marriagesAsPartner1: {
          include: {
            partner2: true,
          },
        },
        marriagesAsPartner2: {
          include: {
            partner1: true,
          },
        },
        deathRecord: true,
        consultations: {
          include: {
            doctor: {
              select: {
                username: true,
              },
            },
            prescriptions: {
              include: {
                medications: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        convictions: {
          include: {
            prosecutor: {
              select: {
                username: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        filedComplaints: {
          include: {
            accused: true,
            policeOfficer: {
              select: {
                username: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        receivedComplaints: {
          include: {
            plaintiff: true,
            policeOfficer: {
              select: {
                username: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    })

    if (!citizen) {
      return NextResponse.json({ error: "Citoyen non trouvé" }, { status: 404 })
    }

    return NextResponse.json(citizen)
  } catch (error) {
    console.error("Error fetching citizen:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Check if user has permission to update citizens
    const hasPermission = session.user.roles.some((role) => ["ADMIN", "OFFICIER_ETAT_CIVIL"].includes(role))

    if (!hasPermission) {
      return NextResponse.json({ error: "Permissions insuffisantes" }, { status: 403 })
    }

    const data = await request.json()

    const citizen = await prisma.citizen.update({
      where: { id: params.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        maidenName: data.maidenName || null,
        birthDate: new Date(data.birthDate),
        birthPlace: data.birthPlace,
        nationality: data.nationality,
        gender: data.gender,
        // ethnicGroup: data.ethnicGroup || null,
        community: data.community || null,
        territory: data.territory || null,
        currentAddress: data.currentAddress,
        phoneNumber: data.phoneNumber || null,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        bloodType: data.bloodType || null,
        disabilities: data.disabilities || null,
        educationLevel: data.educationLevel || null,
        profession: data.profession || null,
        maritalStatus: data.maritalStatus,
        occupation: data.occupation || null,
        religion: data.religion || null,
        taxIdentificationNumber: data.taxIdentificationNumber || null,
        socialSecurityNumber: data.socialSecurityNumber || null,
        drivingLicenseNumber: data.drivingLicenseNumber || null,
        passportNumber: data.passportNumber || null,
        voterStatus: data.voterStatus || null,
      },
      include: {
        user: true,
        images: true,
      },
    })

    return NextResponse.json(citizen)
  } catch (error) {
    console.error("Error updating citizen:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Check if user has permission to delete citizens (assuming only ADMIN can delete)
    const hasPermission = session.user.roles.includes("ADMIN")

    if (!hasPermission) {
      return NextResponse.json({ error: "Permissions insuffisantes" }, { status: 403 })
    }

    await prisma.citizen.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Citoyen supprimé avec succès" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting citizen:", error)
    // Handle record not found error (P2025) more gracefully if required
    return NextResponse.json({ error: "Erreur interne du serveur lors de la suppression" }, { status: 500 })
  }
}
