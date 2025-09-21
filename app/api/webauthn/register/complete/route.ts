import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { citizenId, credentialType, credential } = await request.json()

    // Verify the credential (simplified for demo)
    // In a real implementation, you would:
    // 1. Verify the attestation
    // 2. Check the challenge
    // 3. Validate the signature
    // 4. Store the credential securely

    // For demo purposes, we'll just store basic information
    const webauthnCredential = {
      id: credential.id,
      citizenId,
      type: credentialType,
      name: `${credentialType} credential`,
      createdAt: new Date(),
      // In real implementation, store the public key and other necessary data
    }

    // Store in database (you would need to create a WebAuthnCredential model)
    // await prisma.webAuthnCredential.create({
    //   data: webauthnCredential
    // })

    return NextResponse.json({
      success: true,
      credential: webauthnCredential,
    })
  } catch (error) {
    console.error("Error completing WebAuthn registration:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
