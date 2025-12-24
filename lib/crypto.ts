import { webcrypto } from "crypto"

// Using Web Crypto API available in Node.js 15+
const subtle = webcrypto.subtle

// In a real production environment, this key should be stored in a secure KMS/HSM
// For this demo, we derive it from a high-entropy env var or generate one
const MASTER_KEY_HEX = process.env.ENCRYPTION_KEY || "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff"

async function getKey(): Promise<CryptoKey> {
    const keyBuffer = Buffer.from(MASTER_KEY_HEX, "hex")
    return await subtle.importKey(
        "raw",
        keyBuffer,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    )
}

/**
 * Encrypts a string using AES-256-GCM
 */
export async function encrypt(text: string): Promise<string> {
    const key = await getKey()
    const iv = webcrypto.getRandomValues(new Uint8Array(12)) // 12 bytes IV for GCM
    const encoded = new TextEncoder().encode(text)

    const encrypted = await subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoded
    )

    // Combine IV + Encrypted Data
    const buffer = Buffer.concat([Buffer.from(iv), Buffer.from(encrypted)])
    return buffer.toString("base64")
}

/**
 * Decrypts a string using AES-256-GCM
 */
export async function decrypt(encryptedText: string): Promise<string> {
    const key = await getKey()
    const buffer = Buffer.from(encryptedText, "base64")

    // Extract IV (first 12 bytes)
    const iv = buffer.subarray(0, 12)
    const data = buffer.subarray(12)

    const decrypted = await subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data
    )

    return new TextDecoder().decode(decrypted)
}
