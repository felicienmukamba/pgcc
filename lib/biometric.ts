export interface FaceDescriptor {
  id: string
  citizenId: string
  descriptor: number[]
  confidence: number
  createdAt: Date
}

export interface BiometricMatch {
  citizenId: string
  confidence: number
  citizen: {
    id: string
    firstName: string
    lastName: string
    nationalityID: string
  }
}

export class BiometricService {
  private faceApiEndpoint: string
  private apiKey: string

  constructor() {
    this.faceApiEndpoint = process.env.FACE_API_ENDPOINT || "http://localhost:8080"
    this.apiKey = process.env.FACE_API_KEY || ""
  }

  // Extract face descriptor from image
  async extractFaceDescriptor(imageData: string): Promise<number[] | null> {
    try {
      const response = await fetch(`${this.faceApiEndpoint}/extract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          image: imageData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to extract face descriptor")
      }

      const result = await response.json()
      return result.descriptor
    } catch (error) {
      console.error("Error extracting face descriptor:", error)
      return null
    }
  }

  // Compare face descriptors
  calculateSimilarity(descriptor1: number[], descriptor2: number[]): number {
    if (descriptor1.length !== descriptor2.length) {
      return 0
    }

    let sum = 0
    for (let i = 0; i < descriptor1.length; i++) {
      sum += Math.pow(descriptor1[i] - descriptor2[i], 2)
    }

    const distance = Math.sqrt(sum)
    // Convert distance to similarity score (0-1)
    return Math.max(0, 1 - distance / 2)
  }

  // Find matching citizens by face
  async findMatchingCitizens(
    inputDescriptor: number[],
    storedDescriptors: FaceDescriptor[],
    threshold = 0.6,
  ): Promise<BiometricMatch[]> {
    const matches: BiometricMatch[] = []

    for (const stored of storedDescriptors) {
      const similarity = this.calculateSimilarity(inputDescriptor, stored.descriptor)

      if (similarity >= threshold) {
        // This would need to be populated with actual citizen data
        matches.push({
          citizenId: stored.citizenId,
          confidence: similarity,
          citizen: {
            id: stored.citizenId,
            firstName: "",
            lastName: "",
            nationalityID: "",
          },
        })
      }
    }

    // Sort by confidence (highest first)
    return matches.sort((a, b) => b.confidence - a.confidence)
  }
}

export const biometricService = new BiometricService()
