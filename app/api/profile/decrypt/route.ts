import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Extract identityId from query params (or session if mapped)
        const { searchParams } = new URL(req.url)
        const identityId = searchParams.get("identityId")

        if (!identityId) {
            return new NextResponse("Identity ID required", { status: 400 })
        }

        // Fetch encrypted profile
        const profile = await prisma.citizenProfile.findUnique({
            where: { identityId },
            include: {
                identity: {
                    select: {
                        nationalId: true,
                        mfaEnabled: true
                    }
                }
            }
        })

        if (!profile) {
            return new NextResponse("Profile not found", { status: 404 })
        }

        // Decrypt PII on-the-fly
        const decryptedData = JSON.parse(await decrypt(profile.encryptedData))

        return NextResponse.json({
            nationalId: profile.identity.nationalId,
            mfaEnabled: profile.identity.mfaEnabled,
            ...decryptedData
        })

    } catch (error) {
        console.error("Profile Fetch Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
