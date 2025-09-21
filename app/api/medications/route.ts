import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { type NextRequest } from "next/server"

// GET request to list all medications
export async function GET() {
try {
const session = await getServerSession(authOptions)

if (!session) {
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
}

const medications = await prisma.medication.findMany({
  orderBy: {
    tradeName: "asc",
  },
})

return NextResponse.json(medications)

} catch (error) {
console.error("Error fetching medications:", error)
return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
}
}

// POST request to create a new medication
export async function POST(request: NextRequest) {
try {
const session = await getServerSession(authOptions)

if (!session) {
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
}

// Check if user has permission to create medications
const hasPermission = session.user.roles.some((role) => ["ADMIN", "MEDICAL_STAFF"].includes(role))

if (!hasPermission) {
  return NextResponse.json({ error: "Permissions insuffisantes" }, { status: 403 })
}

const data = await request.json()

const medication = await prisma.medication.create({
  data: {
    tradeName: data.tradeName,
    genericName: data.genericName,
    dosage: data.dosage,
    unit: data.unit,
    adminRoute: data.adminRoute,
    manufacturer: data.manufacturer,
    description: data.description || null,
  },
})

return NextResponse.json(medication)

} catch (error) {
console.error("Error creating medication:", error)
return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
}
}