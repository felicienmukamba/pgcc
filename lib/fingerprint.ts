// import * as tf from '@tensorflow/tfjs-node';

// let model: tf.LayersModel | null = null;
// const MODEL_PATH = 'file://public/model/model.json';

// export const loadModel = async (): Promise<tf.LayersModel> => {
//   if (model) return model;
//   model = await tf.loadLayersModel(MODEL_PATH);
//   return model;
// };

// export async function processFingerprintImage(imageBase64: string, model: tf.LayersModel): Promise<number[] | null> {
//   try {
//     const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
//     const imageBuffer = Buffer.from(base64Data, 'base64');
//     const tensor = tf.node.decodeImage(imageBuffer)
//       .resizeBilinear([128, 128])
//       .toFloat()
//       .div(tf.scalar(255.0))
//       .expandDims(0);
//     const prediction = model.predict(tensor) as tf.Tensor;
//     const embedding = Array.from(await prediction.data());
//     return embedding;
//   } catch (error) {
//     console.error("Erreur de traitement d'image:", error);
//     return null;
//   }
// }

// export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
//   if (vecA.length !== vecB.length) throw new Error("Vecteurs de dimensions différentes.");
//   const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
//   const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
//   const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
//   if (magnitudeA === 0 || magnitudeB === 0) return 0;
//   return dotProduct / (magnitudeA * magnitudeB);
// }

// export function findMatchingFingerprint(
//   scannedEmbedding: number[],
//   allEmbeddings: { citizenId: string; embedding: number[] }[]
// ): { citizenId: string | null; score: number } {
//   let bestMatch = { citizenId: null, score: 0 };
//   const THRESHOLD = 0.75;
//   allEmbeddings.forEach(entry => {
//     const similarity = calculateCosineSimilarity(scannedEmbedding, entry.embedding);
//     if (similarity > bestMatch.score) {
//       bestMatch.score = similarity;
//       bestMatch.citizenId = entry.citizenId;
//     }
//   });
//   if (bestMatch.score > THRESHOLD) return bestMatch;
//   return { citizenId: null, score: bestMatch.score };
// }