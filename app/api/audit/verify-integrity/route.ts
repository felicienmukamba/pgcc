import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyAuditChainIntegrity } from "@/lib/audit-integrity"

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Authentication & Authorization
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.roles.includes("ADMIN")) {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        // 2. Verify Audit Chain
        const result = await verifyAuditChainIntegrity()

        return NextResponse.json(result)

    } catch (error) {
        console.error("Audit Verification Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
