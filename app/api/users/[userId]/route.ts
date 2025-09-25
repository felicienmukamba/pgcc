import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user.roles.includes("ADMIN")) { // Example role check
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        username: true,
        email: true,
        roles: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.roles.includes("ADMIN")) { // Example role check
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { username, email, roles, enabled, newPassword } = await request.json()

    const dataToUpdate: any = {}
    if (username) dataToUpdate.username = username
    if (email) dataToUpdate.email = email
    if (roles) dataToUpdate.roles = roles
    if (enabled !== undefined) dataToUpdate.enabled = enabled
    
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      dataToUpdate.password = hashedPassword
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        email: true,
        roles: true,
        enabled: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.roles.includes("ADMIN")) { // Example role check
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    await prisma.user.delete({
      where: { id: params.userId },
    })

    return NextResponse.json({ message: "Utilisateur supprimé" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}