import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const hasPermission = session.user.roles.some((role) =>
      ["ADMIN", "OFFICIER_ETAT_CIVIL", "MEDECIN"].includes(role)
    );

    if (!hasPermission) {
      return NextResponse.json({ error: "Permissions insuffisantes" }, { status: 403 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const citizenId = formData.get("citizenId") as string;

    if (!citizenId) {
      return NextResponse.json({ error: "ID du citoyen requis" }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const citizen = await prisma.citizen.findUnique({
      where: { id: citizenId },
    });

    if (!citizen) {
      return NextResponse.json({ error: "Citoyen non trouvé" }, { status: 404 });
    }

    const uploadedImages = [];
    const uploadDir = path.join(process.cwd(), "public/uploads");

    // Ensure upload directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${citizenId}_${Date.now()}_${file.name}`;
      const filepath = path.join(uploadDir, filename);

      // Use sharp to optimize/ensure it's a valid image and save it
      // Converting to buffer first or processing directly
      await sharp(buffer)
        .toFile(filepath);

      // Enregistrer le chemin de l'image dans la base de données
      const imageRecord = await prisma.image.create({
        data: {
          path: `/uploads/${filename}`,
          citizenId,
        },
      });
      uploadedImages.push(imageRecord);

      // NOTE: Face detection (face-api.js) removed due to 'canvas' incompatibility with Vercel serverless.
      // If face detection is required, consider a cloud API or a Python microservice.
    }

    return NextResponse.json({
      success: true,
      images: uploadedImages,
      message: `${uploadedImages.length} image(s) téléchargée(s) avec succès`,
    });
  } catch (error) {
    console.error("Erreur de téléchargement des fichiers:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}