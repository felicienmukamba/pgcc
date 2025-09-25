"use client"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { ProfileImageUpload } from "@/components/profile/profile-image-upload"
import { ProfileForm } from "@/components/profile/profile-form"
async function getUserProfile() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      image: true,
      roles: true,
      createdAt: true,
    },
  })
  return user
}

export default async function UserProfilePage() {
  const profile = await getUserProfile()

  if (!profile) {
    return <div className="flex items-center justify-center h-screen text-lg font-semibold">Profil non trouvé.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mon Profil</h1>
      </div>

      <Card className="md:grid md:grid-cols-3">
        <div className="flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r">
          <ProfileImageUpload
            currentImage={profile.image || null}
            username={profile.username}
            onImageUpdated={(newImage) => {

              // Optionally handle image update (e.g., re-fetch profile data)
              console.log("Image de profil mise à jour :", newImage)
            }}
          />
        </div>

        <ProfileForm
          initialData={{
            username: profile.username,
            email: profile.email,
          }}
        />
      </Card>
    </div>
  )
}