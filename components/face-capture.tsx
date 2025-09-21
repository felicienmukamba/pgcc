"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Square, RotateCcw, Check } from "lucide-react"

interface FaceCaptureProps {
  onCapture: (imageData: string) => void
  onError?: (error: string) => void
  title?: string
  description?: string
}

export function FaceCapture({ onCapture, onError, title, description }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string>("")

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
        setError("")
      }
    } catch (err) {
      const errorMessage = "Impossible d'accéder à la caméra. Vérifiez les permissions."
      setError(errorMessage)
      onError?.(errorMessage)
    }
  }, [onError])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedImage(imageData)
    stopCamera()
    onCapture(imageData)
  }, [onCapture, stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {title || "Capture d'image faciale"}
        </CardTitle>
        <CardDescription>{description || "Positionnez votre visage dans le cadre et capturez l'image"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          {!capturedImage ? (
            <div className="relative bg-muted rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
                style={{ display: isStreaming ? "block" : "none" }}
              />
              {!isStreaming && (
                <div className="w-full h-64 flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Caméra non activée</p>
                  </div>
                </div>
              )}
              {/* Face detection overlay */}
              {isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-primary rounded-full opacity-50" />
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <img
                src={capturedImage || "/placeholder.svg"}
                alt="Captured face"
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2">
                <div className="bg-green-500 text-white p-1 rounded-full">
                  <Check className="h-4 w-4" />
                </div>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 justify-center">
          {!isStreaming && !capturedImage && (
            <Button onClick={startCamera}>
              <Camera className="mr-2 h-4 w-4" />
              Activer la caméra
            </Button>
          )}

          {isStreaming && (
            <>
              <Button onClick={capturePhoto} variant="default">
                <Square className="mr-2 h-4 w-4" />
                Capturer
              </Button>
              <Button onClick={stopCamera} variant="outline">
                Annuler
              </Button>
            </>
          )}

          {capturedImage && (
            <Button onClick={retakePhoto} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reprendre
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
