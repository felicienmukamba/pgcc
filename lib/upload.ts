import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export class FileUploadService {
  private static readonly UPLOAD_DIR = join(process.cwd(), "public", "uploads")
  private static readonly ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  static async ensureUploadDir() {
    try {
      await mkdir(this.UPLOAD_DIR, { recursive: true })
    } catch (error) {
      console.error("Error creating upload directory:", error)
    }
  }

  static async uploadImage(file: File, citizenId: string): Promise<string> {
    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP.")
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error("Fichier trop volumineux. Taille maximale: 5MB.")
    }

    await this.ensureUploadDir()

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const filename = `${citizenId}_${timestamp}.${extension}`
    const filepath = join(this.UPLOAD_DIR, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await writeFile(filepath, buffer)

    // Return relative path for database storage
    return `/uploads/${filename}`
  }

  static async uploadMultipleImages(files: File[], citizenId: string): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, citizenId))
    return Promise.all(uploadPromises)
  }

  static validateImageForFaceAPI(file: File): boolean {
    // Additional validation for Face API compatibility
    const validTypes = ["image/jpeg", "image/png"]
    const maxSize = 2 * 1024 * 1024 // 2MB for better Face API performance

    return validTypes.includes(file.type) && file.size <= maxSize
  }
}
