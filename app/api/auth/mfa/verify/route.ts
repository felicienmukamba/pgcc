import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticator } from "otplib"
import { logAction, ActionType } from "@/lib/audit"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { identityId, token } = body

        if (!identityId || !token) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        // 1. Fetch Identity with MFA Secret
        const identity = await prisma.citizenIdentity.findUnique({
            where: { id: identityId }
        })

        if (!identity || !identity.mfaSecret) {
            return new NextResponse("MFA not configured", { status: 400 })
        }

        // 2. Verify TOTP Token
        const isValid = authenticator.verify({
            token,
            secret: identity.mfaSecret
        })

        if (!isValid) {
            await logAction({
                userId: identityId,
                action: "MFA_VERIFY_FAILED",
                entity: "CitizenIdentity",
                entityId: identityId,
                details: "Invalid MFA token attempt",
                ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
            })
            return new NextResponse("Invalid verification code", { status: 401 })
        }

        // 3. Enable MFA (First-time enrollment confirmation)
        if (!identity.mfaEnabled) {
            await prisma.citizenIdentity.update({
                where: { id: identityId },
                data: { mfaEnabled: true }
            })

            await logAction({
                userId: identityId,
                action: ActionType.UPDATE,
                entity: "CitizenIdentity",
                entityId: identityId,
                details: "MFA successfully enabled",
                ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
            })
        } else {
            // Subsequent login MFA verification
            await logAction({
                userId: identityId,
                action: "MFA_VERIFY_SUCCESS",
                entity: "CitizenIdentity",
                entityId: identityId,
                details: "MFA verification successful",
                ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
            })
        }

        return NextResponse.json({
            success: true,
            message: "MFA verified successfully"
        })

    } catch (error) {
        console.error("MFA Verification Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
