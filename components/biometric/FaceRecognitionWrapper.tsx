"use client"

import { FaceRecognition } from "./face-recognition"

export function FaceRecognitionWrapper() {
  return (
    <FaceRecognition
      onMatch={(matches) => {
        console.log("✅ Résultats correspondants :", matches)
      }}
      onError={(error) => {
        console.error("❌ Erreur de reconnaissance faciale :", error)
      }}
    />
  )
}
