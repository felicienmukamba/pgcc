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

    const { citizenId, credentialType } = await request.json()

    // Get citizen information
    const citizen = await prisma.citizen.findUnique({
      where: { id: citizenId },
      include: { user: true },
    })

    if (!citizen) {
      return NextResponse.json({ error: "Citoyen non trouvé" }, { status: 404 })
    }

    // Generate WebAuthn registration options
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    const options = {
      challenge: Array.from(challenge),
      rp: {
        name: process.env.WEBAUTHN_RP_NAME || "Système de Gestion des Citoyens",
        id: process.env.WEBAUTHN_RP_ID || "localhost",
      },
      user: {
        id: Array.from(new TextEncoder().encode(citizen.id)),
        name: citizen.user.email,
        displayName: `${citizen.firstName} ${citizen.lastName}`,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: credentialType === "security-key" ? undefined : "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
      attestation: "direct",
    }

    // Store challenge in session or database for verification
    // In a real implementation, you would store this securely

    return NextResponse.json(options)
  } catch (error) {
    console.error("Error generating WebAuthn options:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
