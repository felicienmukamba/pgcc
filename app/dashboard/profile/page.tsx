import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProfilePageClientWrapper } from "@/components/profile/ProfilePageClientWrapper"
// 👈 Import du Client Wrapper

async function getUserProfile() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
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

  if (!user) {
    return null;
  }
  
  // CRUCIAL : Sérialiser l'objet Date en string (ISO) pour le Client Component
  return {
    ...user,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  };
}

export default async function UserProfilePage() {
  const profile = await getUserProfile()

  if (!profile) {
    return <div className="flex items-center justify-center h-screen text-lg font-semibold text-red-600">
      Erreur de chargement du profil. Veuillez vous reconnecter.
    </div>
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-1">
      <ProfilePageClientWrapper initialProfile={profile} />
    </div>
  )
}