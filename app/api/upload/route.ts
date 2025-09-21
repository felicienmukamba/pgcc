import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FileUploadService } from "@/lib/upload";
import * as faceapi from "face-api.js";
import { Canvas, Image, ImageData, loadImage } from "canvas";
import path from "path";
import fs from "fs/promises";

// Cette ligne adapte face-api.js pour qu'il fonctionne dans Node.js
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;
async function loadModels() {
  if (!modelsLoaded) {
    const modelPath = path.join(process.cwd(), "public", "models");
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
      faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
      faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
    ]);
    modelsLoaded = true;
    console.log("✅ Modèles Face-API chargés.");
  }
}

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

    await loadModels();
    const uploadedImages = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Étape 1 : Sauvegarder le fichier sur le disque
      const filename = `${citizenId}_${Date.now()}_${file.name}`;
      const filepath = path.join(process.cwd(), "public/uploads", filename);
      await fs.writeFile(filepath, buffer);

      // Étape 2 : Enregistrer le chemin de l'image dans la base de données
      const imageRecord = await prisma.image.create({
        data: {
          path: `/uploads/${filename}`,
          citizenId,
        },
      });
      uploadedImages.push(imageRecord);

      // Étape 3 (NOUVELLE) : Détecter le visage et extraire le descripteur
      const img = await loadImage(filepath);
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        // Convertir le descripteur en un tableau standard pour le stockage
        const descriptorArray = Array.from(detection.descriptor);
        // Étape 4 (NOUVELLE) : Enregistrer le descripteur dans la table FaceDescriptor
        await prisma.faceDescriptor.create({
          data: {
            citizenId: citizenId,
            descriptor: descriptorArray,
          },
        });
        console.log(`✅ Descripteur enregistré pour le citoyen ${citizenId}`);
      } else {
        console.warn(`⚠️ Pas de visage détecté dans ${filename}. L'enregistrement du descripteur est ignoré.`);
      }
    }

    return NextResponse.json({
      success: true,
      images: uploadedImages,
      message: `${uploadedImages.length} image(s) téléchargée(s) et analysée(s) avec succès`,
    });
  } catch (error) {
    console.error("Erreur de téléchargement des fichiers:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}