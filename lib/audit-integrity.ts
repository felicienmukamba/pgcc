import { prisma } from "@/lib/prisma"
import { createHash } from "crypto"

/**
 * Calculates SHA-256 hash
 */
function calculateHash(data: string): string {
    return createHash('sha256').update(data).digest('hex')
}

/**
 * Verifies the integrity of the Audit Log chain
 * Returns an array of compromised log entries (if any)
 */
export async function verifyAuditChainIntegrity() {
    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'asc' }
    })

    const compromisedLogs: Array<{
        id: string
        reason: string
        expectedHash?: string
        actualHash?: string
    }> = []

    let previousHash = "GENESIS_HASH"

    for (const log of logs) {
        // Reconstruct the payload that should have been hashed
        const payloadToHash = `${previousHash}|${log.userId}|${log.action}|${log.entity}|${log.entityId || ''}|${log.details || ''}|${log.ipAddress || ''}|${log.createdAt.toISOString()}`

        const expectedHash = calculateHash(payloadToHash)

        // Check if the stored hash matches the expected hash
        if (log.hash !== expectedHash) {
            compromisedLogs.push({
                id: log.id,
                reason: "Hash mismatch - Log may have been tampered with",
                expectedHash,
                actualHash: log.hash || "NULL"
            })
        }

        // Check if prevHash links correctly
        if (log.prevHash !== previousHash) {
            compromisedLogs.push({
                id: log.id,
                reason: "Broken chain link - prevHash does not match previous log's hash"
            })
        }

        previousHash = log.hash || "UNKNOWN"
    }

    return {
        totalLogs: logs.length,
        compromisedCount: compromisedLogs.length,
        isIntact: compromisedLogs.length === 0,
        compromisedLogs
    }
}
