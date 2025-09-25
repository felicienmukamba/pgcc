"use client"

import { useState } from "react"
import { ProfileImageUpload } from "@/components/profile/profile-image-upload"

interface ProfileImageHandlerProps {
    initialImage: string | null
    username: string
}

export function ProfileImageHandler({ initialImage, username }: ProfileImageHandlerProps) {
    const [currentImage, setCurrentImage] = useState(initialImage)

    const handleImageUpdate = (newImage: string) => {
        setCurrentImage(newImage)
        // Optionally, you could re-fetch data here if needed, but useState is often enough
        console.log("Image de profil mise à jour :", newImage)
    }

    return (
        <ProfileImageUpload
            currentImage={currentImage}
            username={username}
            onImageUpdated={handleImageUpdate}
        />
    )
}