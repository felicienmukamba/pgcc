"use client"

import { useState } from "react"
import { FaceCapture } from "./face-capture"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, CheckCircle, XCircle } from "lucide-react"

interface CitizenMatch {
  citizenId: string
  confidence: number
  citizen: {
    id: string
    firstName: string
    lastName: string
    nationalityID: string
    birthDate: string
  }
}

interface FaceRecognitionProps {
  onMatch?: (matches: CitizenMatch[]) => void
  onError?: (error: string) => void
}

export function FaceRecognition({ onMatch, onError }: FaceRecognitionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [matches, setMatches] = useState<CitizenMatch[]>([])
  const [error, setError] = useState<string>("")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const handleCapture = async (imageData: string) => {
    setCapturedImage(imageData)
    setIsProcessing(true)
    setError("")
    setMatches([])

    try {
      const response = await fetch("/api/biometric/recognize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageData,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la reconnaissance faciale")
      }

      const result = await response.json()
      setMatches(result.matches || [])
      onMatch?.(result.matches || [])
    } catch (err) {
      const errorMessage = "Erreur lors de la reconnaissance faciale"
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (confidence >= 0.6) return <CheckCircle className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  const reset = () => {
    setCapturedImage(null)
    setMatches([])
    setError("")
    setIsProcessing(false)
  }

  return (
    <div className="space-y-6">
      <FaceCapture
        onCapture={handleCapture}
        onError={(err) => setError(err)}
        title="Reconnaissance faciale"
        description="Capturez une image pour identifier un citoyen dans la base de données"
      />

      {isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Analyse de l'image en cours...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats de la reconnaissance</CardTitle>
            <CardDescription>{matches.length} correspondance(s) trouvée(s) dans la base de données</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {matches.map((match, index) => (
              <div key={match.citizenId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {match.citizen.firstName} {match.citizen.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">ID: {match.citizen.nationalityID}</p>
                    <p className="text-sm text-muted-foreground">
                      Né(e) le {new Date(match.citizen.birthDate).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getConfidenceIcon(match.confidence)}
                  <Badge className={getConfidenceColor(match.confidence)}>
                    {Math.round(match.confidence * 100)}% de correspondance
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {matches.length === 0 && capturedImage && !isProcessing && !error && (
        <Card>
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucune correspondance trouvée</h3>
            <p className="text-muted-foreground mb-4">
              Aucun citoyen correspondant n'a été trouvé dans la base de données biométrique.
            </p>
            <Button onClick={reset} variant="outline">
              Essayer à nouveau
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
