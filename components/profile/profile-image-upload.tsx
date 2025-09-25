// components/profile-image-upload.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ProfileImageUploadProps {
  currentImage?: string | null
  username: string
  onImageUpdated: (newImageUrl: string) => void
}

export function ProfileImageUpload({ currentImage, username, onImageUpdated }: ProfileImageUploadProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleImageUpload = async () => {
    if (!imageFile) {
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("image", imageFile)

    try {
      const response = await fetch("/api/profile/image", {
        method: "POST",
        body: formData,
      })
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Échec du téléchargement de l'image")
      }

      onImageUpdated(data.user.image)
      toast({
        title: "Succès",
        description: "Photo de profil mise à jour.",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setImageFile(null)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r">
      <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-2">
<Image
  src={URL.createObjectURL(imageFile)}
  alt={`${username}'s profile picture`}
  layout="fill"
  objectFit="cover"
/>
      </div>
      <p className="text-lg font-semibold">{username}</p>
      <div className="mt-4 flex flex-col gap-2 w-full">
        <Label htmlFor="image-upload" className="sr-only">
          Télécharger une image
        </Label>
        <Input id="image-upload" type="file" onChange={handleImageChange} className="w-full" />
        <Button
          onClick={handleImageUpload}
          disabled={!imageFile || isUploading}
          className="w-full"
        >
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {isUploading ? "Téléchargement..." : "Télécharger"}
        </Button>
      </div>
    </div>
  )
}