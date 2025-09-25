import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Fingerprint, Camera, Shield } from "lucide-react"
import { FaceRecognitionWrapper } from "@/components/biometric/FaceRecognitionWrapper"

export default async function BiometricPage() {
  const session = await getServerSession(authOptions)

  // Vérifie les permissions
  const hasPermission = session?.user?.roles?.some((role) =>
    ["ADMIN", "OFFICIER_ETAT_CIVIL", "OPJ", "MEDECIN"].includes(role),
  )

  if (!hasPermission) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Système biométrique</h1>
          <p className="text-muted-foreground">Accès non autorisé</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder au système biométrique.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Système biométrique</h1>
        <p className="text-muted-foreground">
          Identification des citoyens par reconnaissance faciale et empreintes digitales
        </p>
      </div>

      <Tabs defaultValue="face-recognition" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="face-recognition" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Reconnaissance faciale
          </TabsTrigger>
          <TabsTrigger value="fingerprint" className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4" />
            Empreintes digitales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="face-recognition">
          <FaceRecognitionWrapper />
        </TabsContent>

        <TabsContent value="fingerprint">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5" />
                Reconnaissance par empreintes digitales
              </CardTitle>
              <CardDescription>
                Utilisez un scanner d'empreintes digitales pour identifier un citoyen
              </CardDescription>
            </CardHeader>
            <CardContent className="p-12 text-center">
              <Fingerprint className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Scanner d'empreintes digitales</h3>
              <p className="text-muted-foreground mb-4">
                Connectez un scanner d'empreintes digitales compatible pour utiliser cette
                fonctionnalité.
              </p>
              <p className="text-sm text-muted-foreground">
                Cette fonctionnalité nécessite un matériel spécialisé et des pilotes appropriés.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}