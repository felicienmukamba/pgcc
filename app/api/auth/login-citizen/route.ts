import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/hashing"
import { logAction, ActionType } from "@/lib/audit"
// In a real app, we'd use NextAuth's `signIn` or issue a JWT here. 
// For this demo architecture, we'll simulate the validation logic.

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { nationalId, password } = body

        if (!nationalId || !password) {
            return new NextResponse("Missing credentials", { status: 400 })
        }

        // 1. Fetch Identity (No PII fetched here)
        const identity = await prisma.citizenIdentity.findUnique({
            where: { nationalId }
        })

        if (!identity) {
            // Anti-Enumeration: Don't reveal if user exists
            return new NextResponse("Invalid credentials", { status: 401 })
        }

        // 2. Verify Password (Argon2id)
        const isValid = await verifyPassword(identity.passwordHash, password)

        if (!isValid) {
            // Prepare audit log for failed attempt (Security Event)
            await logAction({
                userId: "ANONYMOUS",
                action: ActionType.LOGIN,
                entity: "CitizenIdentity",
                details: `Failed login attempt for ID ending ...${nationalId.slice(-4)}`,
                ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
            })
            return new NextResponse("Invalid credentials", { status: 401 })
        }

        // 3. Check MFA Status
        if (identity.mfaEnabled) {
            return NextResponse.json({
                requireMfa: true,
                identityId: identity.id, // Temporary check ID
                message: "MFA Required"
            })
        }

        // 4. Successful Login (No MFA)
        await logAction({
            userId: identity.id,
            action: ActionType.LOGIN,
            entity: "CitizenIdentity",
            entityId: identity.id,
            details: "Successful secure login",
            ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
        })

        // Return user session data (simulated)
        // In reality, this would set a Secure, HttpOnly Cookie
        return NextResponse.json({
            success: true,
            user: {
                id: identity.id,
                nationalId: identity.nationalId,
            }
        })

    } catch (error) {
        console.error("Login Error:", error)
        return new NextResponse("Internal Secure Error", { status: 500 })
    }
}
