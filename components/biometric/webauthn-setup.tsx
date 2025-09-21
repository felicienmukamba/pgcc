"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Fingerprint, Smartphone, Key, CheckCircle, AlertCircle } from "lucide-react"

interface WebAuthnCredential {
  id: string
  type: string
  name: string
  createdAt: Date
}

interface WebAuthnSetupProps {
  citizenId: string
  existingCredentials?: WebAuthnCredential[]
  onCredentialAdded?: (credential: WebAuthnCredential) => void
}

export function WebAuthnSetup({ citizenId, existingCredentials = [], onCredentialAdded }: WebAuthnSetupProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  const isWebAuthnSupported = () => {
    return typeof window !== "undefined" && "credentials" in navigator && "create" in navigator.credentials
  }

  const registerCredential = async (credentialType: "fingerprint" | "face" | "security-key") => {
    if (!isWebAuthnSupported()) {
      setError("WebAuthn n'est pas supporté par ce navigateur")
      return
    }

    setIsRegistering(true)
    setError("")
    setSuccess("")

    try {
      // Get registration options from server
      const optionsResponse = await fetch("/api/webauthn/register/begin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          citizenId,
          credentialType,
        }),
      })

      if (!optionsResponse.ok) {
        throw new Error("Erreur lors de la préparation de l'enregistrement")
      }

      const options = await optionsResponse.json()

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: new Uint8Array(options.challenge),
          user: {
            ...options.user,
            id: new Uint8Array(options.user.id),
          },
        },
      })

      if (!credential) {
        throw new Error("Échec de la création des identifiants")
      }

      // Send credential to server
      const registerResponse = await fetch("/api/webauthn/register/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          citizenId,
          credentialType,
          credential: {
            id: credential.id,
            rawId: Array.from(new Uint8Array(credential.rawId)),
            response: {
              clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
              attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
            },
            type: credential.type,
          },
        }),
      })

      if (!registerResponse.ok) {
        throw new Error("Erreur lors de l'enregistrement des identifiants")
      }

      const result = await registerResponse.json()
      setSuccess("Identifiants biométriques enregistrés avec succès")
      onCredentialAdded?.(result.credential)
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement")
    } finally {
      setIsRegistering(false)
    }
  }

  const getCredentialIcon = (type: string) => {
    switch (type) {
      case "fingerprint":
        return <Fingerprint className="h-4 w-4" />
      case "face":
        return <Smartphone className="h-4 w-4" />
      case "security-key":
        return <Key className="h-4 w-4" />
      default:
        return <Key className="h-4 w-4" />
    }
  }

  const getCredentialName = (type: string) => {
    switch (type) {
      case "fingerprint":
        return "Empreinte digitale"
      case "face":
        return "Reconnaissance faciale"
      case "security-key":
        return "Clé de sécurité"
      default:
        return type
    }
  }

  if (!isWebAuthnSupported()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            WebAuthn non supporté
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Votre navigateur ne supporte pas WebAuthn. Veuillez utiliser un navigateur moderne pour accéder aux
            fonctionnalités biométriques.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Configuration biométrique WebAuthn
          </CardTitle>
          <CardDescription>Configurez les méthodes d'authentification biométrique pour ce citoyen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-center space-y-2">
                <Fingerprint className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">Empreinte digitale</h3>
                <p className="text-sm text-muted-foreground">Utilisez votre empreinte digitale</p>
                <Button
                  size="sm"
                  onClick={() => registerCredential("fingerprint")}
                  disabled={isRegistering}
                  className="w-full"
                >
                  Configurer
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center space-y-2">
                <Smartphone className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">Reconnaissance faciale</h3>
                <p className="text-sm text-muted-foreground">Utilisez la caméra de votre appareil</p>
                <Button
                  size="sm"
                  onClick={() => registerCredential("face")}
                  disabled={isRegistering}
                  className="w-full"
                >
                  Configurer
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center space-y-2">
                <Key className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">Clé de sécurité</h3>
                <p className="text-sm text-muted-foreground">Utilisez une clé de sécurité physique</p>
                <Button
                  size="sm"
                  onClick={() => registerCredential("security-key")}
                  disabled={isRegistering}
                  className="w-full"
                >
                  Configurer
                </Button>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {existingCredentials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Identifiants configurés</CardTitle>
            <CardDescription>Méthodes biométriques déjà configurées pour ce citoyen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {existingCredentials.map((credential) => (
                <div key={credential.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getCredentialIcon(credential.type)}
                    <div>
                      <p className="font-medium">{getCredentialName(credential.type)}</p>
                      <p className="text-sm text-muted-foreground">
                        Configuré le {new Date(credential.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Actif</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
