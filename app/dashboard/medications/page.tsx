import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FlaskConical, Search, Plus, Pill } from "lucide-react"

async function getMedications() {
  // Mock data to replace the Prisma call
  return [
    {
      id: "med1",
      tradeName: "Doliprane",
      genericName: "Paracétamol",
      dosage: "500",
      unit: "mg",
      adminRoute: "Voie orale",
      manufacturer: "Sanofi",
    },
    {
      id: "med2",
      tradeName: "Amoxicilline",
      genericName: "Amoxicilline",
      dosage: "1000",
      unit: "mg",
      adminRoute: "Voie orale",
      manufacturer: "Biogaran",
    },
    {
      id: "med3",
      tradeName: "Spasfon",
      genericName: "Phloroglucinol",
      dosage: "80",
      unit: "mg",
      adminRoute: "Voie orale",
      manufacturer: "Teva",
    },
  ];
}

export default async function MedicationsPage() {
  // Mock session and permissions since next-auth is not available
  const hasWritePermission = true;

  const medications = await getMedications()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des médicaments</h1>
          <p className="text-muted-foreground">Gérez le catalogue de médicaments</p>
        </div>
        {hasWritePermission && (
          <Button asChild>
            <a href="/dashboard/medications/new">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un médicament
            </a>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recherche et filtres</CardTitle>
          <CardDescription>Trouvez rapidement un médicament</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Rechercher par nom commercial ou générique..." className="w-full" />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par voie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les voies</SelectItem>
                <SelectItem value="orale">Voie orale</SelectItem>
                <SelectItem value="injectable">Voie injectable</SelectItem>
                <SelectItem value="topique">Voie topique</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {medications.map((medication) => (
          <Card key={medication.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Pill className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{medication.tradeName}</h3>
                    <p className="text-sm text-muted-foreground">{medication.genericName}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="default">{medication.dosage} {medication.unit}</Badge>
                      <Badge variant="secondary">{medication.adminRoute}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Fabricant: {medication.manufacturer}
                  </p>
                  <div className="mt-2 space-x-2">
                    {hasWritePermission && (
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Voir détails
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {medications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun médicament trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Aucun médicament ne correspond aux critères de recherche.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
