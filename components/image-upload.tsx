"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, AlertCircle, CheckCircle } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  citizenId: string
  onUploadComplete?: (images: any[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
}

export function ImageUpload({
  citizenId,
  onUploadComplete,
  maxFiles = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
}: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles = Array.from(selectedFiles)

    // Validate file count
    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} fichiers autorisés`)
      return
    }

    // Validate file types and sizes
    const validFiles: File[] = []
    const newPreviews: string[] = []

    for (const file of newFiles) {
      if (!acceptedTypes.includes(file.type)) {
        setError(`Type de fichier non autorisé: ${file.name}`)
        continue
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        setError(`Fichier trop volumineux: ${file.name}`)
        continue
      }

      validFiles.push(file)
      newPreviews.push(URL.createObjectURL(file))
    }

    setFiles((prev) => [...prev, ...validFiles])
    setPreviews((prev) => [...prev, ...newPreviews])
    setError(null)
  }

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      setError("Aucun fichier sélectionné")
      return
    }

    setUploading(true)
    setProgress(0)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("citizenId", citizenId)

      files.forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors du téléchargement")
      }

      const result = await response.json()
      setSuccess(result.message)

      // Clear files and previews
      previews.forEach((preview) => URL.revokeObjectURL(preview))
      setFiles([])
      setPreviews([])

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Callback with uploaded images
      if (onUploadComplete) {
        onUploadComplete(result.images)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erreur inconnue")
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Téléchargement d'Images
        </CardTitle>
        <CardDescription>
          Téléchargez des photos du citoyen pour la reconnaissance faciale et l'identification. Formats acceptés: JPEG,
          PNG, WebP. Taille max: 5MB par fichier.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || files.length >= maxFiles}
          >
            <Upload className="h-4 w-4 mr-2" />
            Sélectionner des fichiers
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            {files.length}/{maxFiles} fichiers sélectionnés
          </p>
        </div>

        {/* File Previews */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square relative rounded-lg overflow-hidden border">
                  <Image src={previews[index] || "/placeholder.svg"} alt={file.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="sm" variant="destructive" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center">Téléchargement en cours...</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <Button onClick={uploadFiles} disabled={uploading} className="w-full">
            {uploading ? "Téléchargement..." : `Télécharger ${files.length} fichier(s)`}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
