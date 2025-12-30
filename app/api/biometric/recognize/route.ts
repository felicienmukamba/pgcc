import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as faceapi from "face-api.js";
import sharp from "sharp";
import path from "path";

// No monkeyPatch needed if we pass tensors directly from sharp

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
        if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const hasPermission = session.user.roles.some((r) =>
            ["ADMIN", "OFFICIER_ETAT_CIVIL", "OPJ", "MEDECIN"].includes(r)
        );
        if (!hasPermission) return NextResponse.json({ error: "Permissions insuffisantes" }, { status: 403 });

        const body = await request.json();
        const { image } = body;

        if (!image) return NextResponse.json({ error: "Image Base64 requise" }, { status: 400 });

        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // SHARP -> TENSOR
        const { data, info } = await sharp(buffer)
            .raw()
            .toBuffer({ resolveWithObject: true });

        const tensor = faceapi.tf.tensor3d(
            new Uint8Array(data),
            [info.height, info.width, info.channels]
        );

        await loadModels();

        const detection = await faceapi
            .detectSingleFace(tensor as any)
            .withFaceLandmarks()
            .withFaceDescriptor();

        tensor.dispose(); // Important cleanup

        if (!detection) {
            return NextResponse.json({ matches: [], message: "Aucun visage détecté" }, { status: 200 });
        }

        // Database lookup (re-use existing logic)
        const citizens = await prisma.faceDescriptor.findMany({
            select: {
                citizenId: true,
                descriptor: true,
                citizen: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        nationalityID: true,
                        birthDate: true,
                    },
                },
            },
        });

        if (!citizens.length) {
            return NextResponse.json({ matches: [], message: "Aucun citoyen enregistré" }, { status: 200 });
        }

        const labeledDescriptors = citizens.map(
            (c) =>
                new faceapi.LabeledFaceDescriptors(c.citizenId, [
                    Float32Array.from(c.descriptor as number[]),
                ])
        );

        // Threshold 0.6
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

        const matches =
            bestMatch.label !== "unknown"
                ? [
                    {
                        citizenId: bestMatch.label,
                        confidence: 1 - bestMatch.distance,
                        citizen: citizens.find((c) => c.citizenId === bestMatch.label)?.citizen,
                    },
                ]
                : [];

        return NextResponse.json({ matches });

    } catch (e) {
        console.error("❌ Erreur reconnaissance faciale:", e);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}