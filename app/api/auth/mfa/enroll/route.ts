import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticator } from "otplib"
import { logAction, ActionType } from "@/lib/audit"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { identityId } = body

        if (!identityId) {
            return new NextResponse("Missing identity ID", { status: 400 })
        }

        // 1. Fetch Identity
        const identity = await prisma.citizenIdentity.findUnique({
            where: { id: identityId }
        })

        if (!identity) {
            return new NextResponse("Identity not found", { status: 404 })
        }

        if (identity.mfaEnabled) {
            return new NextResponse("MFA already enabled", { status: 409 })
        }

        // 2. Generate TOTP Secret
        const secret = authenticator.generateSecret()

        // 3. Generate QR Code URI
        const otpauthUrl = authenticator.keyuri(
            identity.nationalId,
            "Gov-Citizen National ID",
            secret
        )

        // 4. Store Secret (Temporarily - will be confirmed after verification)
        await prisma.citizenIdentity.update({
            where: { id: identityId },
            data: { mfaSecret: secret }
        })

        // 5. Audit Log
        await logAction({
            userId: identityId,
            action: ActionType.UPDATE,
            entity: "CitizenIdentity",
            entityId: identityId,
            details: "MFA enrollment initiated",
            ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
        })

        return NextResponse.json({
            success: true,
            secret,
            qrCodeUrl: otpauthUrl,
            message: "Scan QR code with your authenticator app"
        })

    } catch (error) {
        console.error("MFA Enrollment Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
