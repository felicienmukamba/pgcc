import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { loadModel, processFingerprintImage } from '@/lib/fingerprint';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, citizenId } = await req.json();
    if (!imageBase64 || !citizenId) {
      return NextResponse.json({ message: 'Missing image or citizen ID' }, { status: 400 });
    }
    const model = await loadModel();
    const embedding = await processFingerprintImage(imageBase64, model);
    if (!embedding) {
      return NextResponse.json({ message: 'Failed to process image' }, { status: 500 });
    }
    await prisma.fingerprintEmbedding.create({
      data: { citizenId, embedding },
    });
    return NextResponse.json({ success: true, message: 'Empreinte enregistrée avec succès.' });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur interne.' }, { status: 500 });
  }
}