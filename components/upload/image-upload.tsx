"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, AlertCircle, CheckCircle, Camera } from "lucide-react"
import Image from "next/image"

// Importations pour la modale et le composant de capture faciale
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FaceCapture } from "@/components/biometric/face-capture"
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

  // État pour contrôler l'affichage de la modale de capture faciale
  const [showCameraCapture, setShowCameraCapture] = useState(false)

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles = Array.from(selectedFiles)

    // Validate file count
    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} fichiers autorisés.`)
      return
    }

    // Validate file types and sizes
    const validFiles: File[] = []
    const newPreviews: string[] = []

    for (const file of newFiles) {
      if (!acceptedTypes.includes(file.type)) {
        setError(`Type de fichier non autorisé: ${file.name}.`)
        continue
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        setError(`Fichier trop volumineux: ${file.name} (max 5MB).`)
        continue
      }

      validFiles.push(file)
      newPreviews.push(URL.createObjectURL(file))
    }

    setFiles((prev) => [...prev, ...validFiles])
    setPreviews((prev) => [...prev, ...newPreviews])
    setError(null)
  }

  const handleCameraCapture = useCallback((imageData: string) => {
    // Convert base64 imageData to a File object
    const byteString = atob(imageData.split(',')[1]);
    const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const capturedFile = new File([ab], `camera_capture_${Date.now()}.jpeg`, { type: mimeString });

    // Add the captured file to the list of files to upload
    if (files.length < maxFiles) {
        setFiles((prev) => [...prev, capturedFile]);
        setPreviews((prev) => [...prev, imageData]); // Use imageData directly for preview
        setError(null);
    } else {
        setError(`Maximum ${maxFiles} fichiers autorisés.`)
    }
    setShowCameraCapture(false); // Close the camera modal
  }, [files, maxFiles]);


  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      setError("Aucun fichier sélectionné pour le téléchargement.")
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

      // Simulate upload progress
      const totalFiles = files.length;
      let uploadedCount = 0;
      for (let i = 0; i < totalFiles; i++) {
        // Simulate individual file upload
        await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for visual effect
        uploadedCount++;
        setProgress(Math.round((uploadedCount / totalFiles) * 100));
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du téléchargement");
      }

      // const result = await response.json();
      const result = { message: "Fichiers téléchargés avec succès !", images: files.map(f => ({ name: f.name, url: "" })) } // Simulated result
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
      setError(error instanceof Error ? error.message : "Erreur inconnue lors du téléchargement.")
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
          Téléchargez des photos du citoyen pour la reconnaissance faciale et l'identification, ou prenez-en une
          directement. Formats acceptés: JPEG, PNG, WebP. Taille max: 5MB par fichier.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input & Camera Button */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || files.length >= maxFiles}
            >
              <Upload className="h-4 w-4 mr-2" />
              Sélectionner des fichiers
            </Button>
            <Dialog open={showCameraCapture} onOpenChange={setShowCameraCapture}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading || files.length >= maxFiles}
                  onClick={() => setShowCameraCapture(true)}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Prendre une photo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Capture Faciale</DialogTitle>
                  <DialogDescription>
                    Positionnez votre visage dans le cadre et capturez l'image.
                  </DialogDescription>
                </DialogHeader>
                <FaceCapture
                  onCapture={handleCameraCapture}
                  onError={setError}
                  title="Capture par caméra"
                  description="Assurez-vous que votre visage est bien éclairé."
                />
              </DialogContent>
            </Dialog>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {files.length}/{maxFiles} fichiers sélectionnés
          </p>
        </div>

        {/* File Previews */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={file.name + index} className="relative group">
                <div className="aspect-square relative rounded-lg overflow-hidden border">
                  <Image
                    src={previews[index] || "/placeholder.svg"}
                    alt={file.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
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
            <p className="text-sm text-muted-foreground text-center">Téléchargement en cours... {progress}%</p>
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