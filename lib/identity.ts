import { v7 as uuidv7 } from "uuid"

// Verhoeff Algorithm Tables
const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
]

const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
]

const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]

/**
 * Validates a number string using the Verhoeff algorithm
 */
export function validateVerhoeff(num: string): boolean {
    let c = 0
    const myArray = String(num).split("").map(Number).reverse()

    for (let i = 0; i < myArray.length; i++) {
        c = d[c][p[i % 8][myArray[i]]]
    }

    return c === 0
}

/**
 * Generates the Verhoeff checksum digit
 */
export function generateVerhoeff(num: string): string {
    let c = 0
    const myArray = String(num).split("").map(Number).reverse()

    for (let i = 0; i < myArray.length; i++) {
        c = d[c][p[(i + 1) % 8][myArray[i]]]
    }

    return inv[c].toString()
}

/**
 * Generates a globally unique UUIDv7
 */
export function generateCitizenId(): string {
    return uuidv7()
}
