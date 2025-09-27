"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, User2 } from "lucide-react" 
import { toast } from "@/hooks/use-toast"

interface ProfileImageUploadProps {
  currentImage?: string | null
  username: string
  onImageUpdated: (newImageUrl: string) => void 
}

export function ProfileImageUpload({ currentImage, username, onImageUpdated }: ProfileImageUploadProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const previewUrl = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile)
    }
    return currentImage || null
  }, [imageFile, currentImage])

  useEffect(() => {
    // Nettoyage de la Blob URL
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) { 
          toast({
              title: "Erreur",
              description: "Le fichier est trop volumineux (max 5MB).",
              variant: "destructive",
          });
          e.target.value = '';
          setImageFile(null);
          return;
      }
      
      setImageFile(file)
    }
  }

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast({ title: "Erreur", description: "Veuillez sélectionner une image à télécharger.", variant: "destructive" });
      return;
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

      // Appel de la fonction de rappel du parent
      onImageUpdated(data.user.image) 
      
      toast({
        title: "Succès",
        description: "Photo de profil mise à jour.",
      })
      
    } catch (error: any) {
      console.error("Erreur lors du téléchargement:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur inconnue s'est produite.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setImageFile(null) 
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-indigo-500 bg-gray-100 flex items-center justify-center shadow-lg">
        
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={`Photo de profil de ${username}`}
            width={128}
            height={128}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/128x128/f3f4f6/a1a1aa?text=Image+invalide'; 
            }}
          />
        ) : (
          <User2 className="w-16 h-16 text-indigo-400" />
        )}
        <div className="absolute inset-0 bg-black opacity-10 rounded-full"></div>
      </div>
      
      <p className="text-xl font-bold text-center text-gray-900 mb-4">{username}</p>
      
      <div className="mt-4 flex flex-col gap-3 w-full max-w-xs">
        <div className="space-y-2">
            <Label htmlFor="image-upload" className="text-sm font-medium text-gray-700">
                Choisir un fichier (Max 5MB)
            </Label>
            <Input 
                id="image-upload" 
                type="file" 
                onChange={handleImageChange} 
                className="w-full cursor-pointer " 
                accept="image/png, image/jpeg, image/gif" 
            />
        </div>

        <Button
          onClick={handleImageUpload}
          disabled={!imageFile || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Téléchargement en cours...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> 
              {imageFile ? "Confirmer et Enregistrer" : "Sélectionner pour Uploader"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}