import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/crypto"
import { hashPassword } from "@/lib/hashing"
import { generateCitizenId, validateVerhoeff } from "@/lib/identity"
import { logAction, ActionType } from "@/lib/audit"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { nationalId, password, firstName, lastName, email, phoneNumber, birthDate, address } = body

        // 1. Validate Input (Basic)
        if (!nationalId || !password || !firstName || !lastName) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        // 2. Validate National ID Checksum (Verhoeff)
        if (!validateVerhoeff(nationalId)) {
            return new NextResponse("Invalid National ID Checksum", { status: 400 })
        }

        // 3. Check for existing identity
        const existingIdentity = await prisma.citizenIdentity.findUnique({
            where: { nationalId }
        })

        if (existingIdentity) {
            return new NextResponse("Identity already registered", { status: 409 })
        }

        // 4. Cryptography: Hash Password & Encrypt PII
        const hashedPassword = await hashPassword(password)

        // PII Payload to Encrypt
        const piiData = {
            firstName,
            lastName,
            email,
            phoneNumber,
            birthDate,
            address
        }

        const encryptedProfileData = await encrypt(JSON.stringify(piiData))

        // 5. Create Identity & Profile Transactionally
        const result = await prisma.$transaction(async (tx: any) => {
            // A. Create Core Identity
            const identity = await tx.citizenIdentity.create({
                data: {
                    id: generateCitizenId(), // UUIDv7
                    nationalId,
                    passwordHash: hashedPassword,
                    // mfaSecret will be set during MFA enrollment
                }
            })

            // B. Create Encrypted Profile
            await tx.citizenProfile.create({
                data: {
                    identityId: identity.id,
                    encryptedData: encryptedProfileData,
                    // Blind Indexes / Search Hashes (Optional - for this demo we skip secure blind indexing logic)
                    emailHash: undefined,
                }
            })

            return identity
        })

        // 6. Audit Logging (Immutable)
        // We log the CREATION of an identity, but NEVER the PII or Password
        await logAction({
            userId: "SYSTEM_REGISTRY", // Or the ID of the agent performing enrollment
            action: ActionType.CREATE,
            entity: "CitizenIdentity",
            entityId: result.id,
            details: `New National Identity Created for ID ending in ...${nationalId.slice(-4)}`,
            ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
        })

        return NextResponse.json({
            success: true,
            message: "Citizen Identity Securely Created",
            identityId: result.id
        })

    } catch (error) {
        console.error("Registration Error:", error)
        return new NextResponse("Internal Secure Error", { status: 500 })
    }
}
