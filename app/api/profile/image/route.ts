// app/api/profile/image/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("image") as File | null

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier n'a été téléchargé" }, { status: 400 })
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create a unique file name
    // Sanitize filename to remove spaces and special chars
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${session.user.id}-${Date.now()}-${safeName}`

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads/user");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName)
    const fileUrl = `/uploads/user/${fileName}`

    // Write the file to the local filesystem
    await writeFile(filePath, buffer)

    // Update the user's profile with the new image URL
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        image: fileUrl,
      },
      select: {
        id: true,
        image: true,
      },
    })

    return NextResponse.json({ message: "Image téléchargée avec succès", user: updatedUser })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: "Échec du téléchargement de l'image" }, { status: 500 })
  }
}