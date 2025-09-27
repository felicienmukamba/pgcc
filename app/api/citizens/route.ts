import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Check if user has permission to create citizens
    const hasPermission = session.user.roles.some((role) => ["ADMIN", "OFFICIER_ETAT_CIVIL"].includes(role))

    if (!hasPermission) {
      return NextResponse.json({ error: "Permissions insuffisantes" }, { status: 403 })
    }

    const data = await request.json()
    const hashedPassword = await bcrypt.hash(data.nationalityID, 10)

    // Create user account first
    const user = await prisma.user.create({
      data: {
        email: `${data.nationalityID}@gov.local`, // Temporary email
        username: `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}`,
        roles: ["CITOYEN"],
      },
    })

    await prisma.account.create({
      data: {
      userId: user.id,
      type: "credentials",
      provider: "credentials",
      providerAccountId: user.email,
      access_token: hashedPassword,
      },
    })

    // Create citizen record
    const citizen = await prisma.citizen.create({
      data: {
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        maidenName: data.maidenName || null,
        birthDate: new Date(data.birthDate),
        birthPlace: data.birthPlace,
        nationalityID: data.nationalityID,
        nationality: data.nationality,
        gender: data.gender,
        ethnicGroup: data.ethnicGroup || null,
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
      },
    })

    return NextResponse.json(citizen)
  } catch (error) {
    console.error("Error creating citizen:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const citizens = await prisma.citizen.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(citizens)
  } catch (error) {
    console.error("Error fetching citizens:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
