"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

// Interface pour le modèle de données Citizen
interface Citizen {
  id: string
  firstName: string
  lastName: string
  nationalityID: string
}

// Nouveau composant de recherche et sélection qui filtre localement
const CitizenSearchField = ({
  label,
  required,
  onCitizenSelect,
  citizens,
}: {
  label: string;
  required: boolean;
  onCitizenSelect: (citizen: Citizen | null) => void;
  citizens: Citizen[];
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);

  // Filtrage local basé sur la recherche
  const filteredCitizens = citizens.filter(
    (citizen) =>
      citizen.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      citizen.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      citizen.nationalityID.includes(searchQuery)
  );

  const selectCitizen = (citizen: Citizen) => {
    setSelectedCitizen(citizen);
    onCitizenSelect(citizen);
    setSearchQuery("");
  };

  const removeCitizen = () => {
    setSelectedCitizen(null);
    onCitizenSelect(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label.replace(/\s/g, "")}>{label} {required && "*"}</Label>
      {!selectedCitizen ? (
        <>
          <Input
            id={label.replace(/\s/g, "")}
            placeholder={`Rechercher par nom ou ID national...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length > 0 && filteredCitizens.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2">
              {filteredCitizens.map((citizen) => (
                <div
                  key={citizen.id}
                  className="p-3 rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => selectCitizen(citizen)}
                >
                  <div className="font-medium">
                    {citizen.firstName} {citizen.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">ID: {citizen.nationalityID}</div>
                </div>
              ))}
            </div>
          )}
          {searchQuery.length > 0 && filteredCitizens.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun résultat trouvé.</p>
          )}
        </>
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted">
          <div>
            <div className="font-medium">
              {selectedCitizen.firstName} {selectedCitizen.lastName}
            </div>
            <div className="text-sm text-muted-foreground">ID: {selectedCitizen.nationalityID}</div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={removeCitizen}>
            <X className="h-4 w-4 mr-2" />
            Changer
          </Button>
        </div>
      )}
    </div>
  );
};


export default function NewDeathRecordPage() {
  const router = useRouter()
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false)
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [selectedDeclarant, setSelectedDeclarant] = useState<Citizen | null>(null);

  const [formData, setFormData] = useState({
    deathDate: "",
    deathPlace: "",
    causeOfDeath: "",
    registrationNumber: "",
    registrationDate: "",
    informantRelationship: "",
  })

  // Récupérer tous les citoyens au chargement de la page
  useEffect(() => {
    const fetchCitizens = async () => {
      try {
        const response = await fetch("/api/citizens");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des citoyens.");
        }
        const data = await response.json();
        setCitizens(data);
      } catch (error) {
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger la liste des citoyens.",
          variant: "destructive",
        });
      }
    };
    fetchCitizens();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!selectedCitizen) {
        toast({
            title: "Erreur",
            description: "Veuillez sélectionner le citoyen décédé.",
            variant: "destructive",
        });
        setLoading(false);
        return;
    }

    try {
      const response = await fetch("/api/death-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...formData,
            citizenId: selectedCitizen.id,
            declarerId: selectedDeclarant?.id,
            officiantId: session?.user?.id,
            informantRelationship: formData.informantRelationship,
        }),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Acte de décès créé avec succès",
        })
        router.push("/dashboard/death-records")
      } else {
        throw new Error("Erreur lors de la création")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'acte de décès",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const registrarId = session?.user?.id;

  if (status === "loading" || citizens.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Chargement en cours...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user?.roles.some(role => ["ADMIN", "OFFICIER_ETAT_CIVIL"].includes(role))) {
    router.push("/login");
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/death-records">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gov-primary">Nouvel Acte de Décès</h1>
          <p className="text-muted-foreground">Enregistrer un nouvel acte de décès</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du Décès</CardTitle>
          <CardDescription>Remplissez tous les champs requis pour créer l'acte de décès</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Numéro d'enregistrement *</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, registrationNumber: e.target.value }))}
                  required
                />
              </div>
              <CitizenSearchField label="Citoyen" required={true} onCitizenSelect={setSelectedCitizen} citizens={citizens} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deathDate">Date de décès *</Label>
                <Input
                  id="deathDate"
                  type="date"
                  value={formData.deathDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deathDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deathPlace">Lieu de décès *</Label>
                <Input
                  id="deathPlace"
                  value={formData.deathPlace}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deathPlace: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="causeOfDeath">Cause du décès</Label>
              <Textarea
                id="causeOfDeath"
                value={formData.causeOfDeath}
                onChange={(e) => setFormData((prev) => ({ ...prev, causeOfDeath: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationDate">Date d'enregistrement *</Label>
                <Input
                  id="registrationDate"
                  type="date"
                  value={formData.registrationDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, registrationDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrar">Officier d'état civil</Label>
                <Input
                  id="registrar"
                  value={registrarId}
                  readOnly
                  className="cursor-not-allowed bg-muted"
                />
              </div>
            </div>

            <CitizenSearchField label="Déclarant" required={false} onCitizenSelect={setSelectedDeclarant} citizens={citizens} />

            <div className="space-y-2">
              <Label htmlFor="informantRelationship">Relation du déclarant avec le défunt</Label>
              <Input
                id="informantRelationship"
                value={formData.informantRelationship}
                onChange={(e) => setFormData((prev) => ({ ...prev, informantRelationship: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/death-records">
                <Button variant="outline" type="button">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading || !selectedCitizen}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
