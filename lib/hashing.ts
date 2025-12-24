import argon2 from "argon2"

/**
 * Hash a password using Argon2id (OWASP recommended)
 */
export async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
    })
}

/**
 * Verify a password against an Argon2id hash
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
        return await argon2.verify(hash, password)
    } catch (err) {
        return false
    }
}
