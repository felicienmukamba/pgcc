import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { loadModel, processFingerprintImage, findMatchingFingerprint } from '@/lib/fingerprint';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ message: 'Missing image' }, { status: 400 });
    }
    const model = await loadModel();
    const scannedEmbedding = await processFingerprintImage(imageBase64, model);
    if (!scannedEmbedding) {
      return NextResponse.json({ message: 'Failed to process image' }, { status: 500 });
    }
    const allEmbeddings = await prisma.fingerprintEmbedding.findMany({
      select: { citizenId: true, embedding: true },
    });
    const matchResult = findMatchingFingerprint(scannedEmbedding, allEmbeddings);
    if (matchResult.citizenId) {
      const citizen = await prisma.citizen.findUnique({
        where: { id: matchResult.citizenId },
        select: { firstName: true, lastName: true },
      });
      return NextResponse.json({ success: true, message: 'Citoyen identifié.', citizen, score: matchResult.score });
    } else {
      return NextResponse.json({ success: false, message: 'Aucune correspondance trouvée.' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Erreur interne.' }, { status: 500 });
  }
}