"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

const marriageTypes = ["CIVIL", "RELIGIOUS", "TRADITIONAL"];
const contractTypes = ["COMMUNITY_PROPERTY", "SEPARATION_OF_PROPERTY"];

// Composant réutilisable pour la recherche de citoyen
const CitizenSearchField = ({ label, required, onCitizenSelect }: { label: string, required: boolean, onCitizenSelect: (citizen: Citizen | null) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Citizen[]>([]);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      try {
        // Envoi de la requête à l'API avec le paramètre 'query'
        const response = await fetch(`/api/citizens`);
        if (!response.ok) {
          throw new Error("Erreur lors de la recherche des citoyens.");
        }
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        toast({
          title: "Erreur de recherche",
          description: "Impossible de rechercher les citoyens.",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectCitizen = (citizen: Citizen) => {
    setSelectedCitizen(citizen);
    onCitizenSelect(citizen);
    setSearchQuery("");
    setSearchResults([]);
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
          <div className="flex gap-2">
            <Input
              id={label.replace(/\s/g, "")}
              placeholder={`Rechercher le ${label.toLowerCase()} par nom ou ID national...`}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={isSearching}
            />
          </div>
          {isSearching && <p className="text-sm text-muted-foreground">Recherche en cours...</p>}
          {searchQuery.length > 2 && searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2">
              {searchResults.map((citizen) => (
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
          {searchQuery.length > 2 && searchResults.length === 0 && !isSearching && (
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


export default function NewMarriageRecordPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  // States for citizen selections
  const [husband, setHusband] = useState<Citizen | null>(null);
  const [wife, setWife] = useState<Citizen | null>(null);
  const [witness1, setWitness1] = useState<Citizen | null>(null);
  const [witness2, setWitness2] = useState<Citizen | null>(null);
  const [witness3, setWitness3] = useState<Citizen | null>(null);

  // Form data state for non-citizen fields
  const [formData, setFormData] = useState({
    marriageDate: "",
    marriagePlace: "",
    marriageType: "",
    contractType: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!husband || !wife || !witness1 || !witness2) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner l'époux, l'épouse et au moins deux témoins.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/marriage-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          partner1Id: husband.id,
          partner2Id: wife.id,
          witness1Id: witness1.id,
          witness2Id: witness2.id,
          witness3Id: witness3?.id, // witness3 is optional
        }),
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Acte de mariage créé avec succès",
        });
        router.push("/dashboard/marriage-records");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Impossible de créer l'acte de mariage: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Gérer le statut de la session
  if (status === "loading") {
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

  const registrarId = session?.user?.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/marriage-records">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gov-primary">Nouvel Acte de Mariage</h1>
          <p className="text-muted-foreground">Enregistrer un nouvel acte de mariage</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du Mariage</CardTitle>
          <CardDescription>Remplissez tous les champs requis pour créer l'acte de mariage</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marriageType">Type de mariage *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, marriageType: value }))} required>
                  <SelectTrigger id="marriageType">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {marriageTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractType">Type de contrat (Optionnel)</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, contractType: value }))}>
                  <SelectTrigger id="contractType">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CitizenSearchField label="Époux" required={true} onCitizenSelect={setHusband} />
              <CitizenSearchField label="Épouse" required={true} onCitizenSelect={setWife} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marriageDate">Date du mariage *</Label>
              <Input
                id="marriageDate"
                type="date"
                value={formData.marriageDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, marriageDate: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="marriagePlace">Lieu du mariage *</Label>
              <Input
                id="marriagePlace"
                value={formData.marriagePlace}
                onChange={(e) => setFormData((prev) => ({ ...prev, marriagePlace: e.target.value }))}
                required
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Témoins</CardTitle>
                <CardDescription>Sélectionnez au moins deux témoins. Un troisième est optionnel.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <CitizenSearchField label="Témoin 1" required={true} onCitizenSelect={setWitness1} />
                <CitizenSearchField label="Témoin 2" required={true} onCitizenSelect={setWitness2} />
                <CitizenSearchField label="Témoin 3 (Optionnel)" required={false} onCitizenSelect={setWitness3} />
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="officiant">Officier d'état civil</Label>
              <Input id="officiant" value={registrarId} readOnly className="cursor-not-allowed bg-muted" />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/marriage-records">
                <Button variant="outline" type="button">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading || !husband || !wife || !witness1 || !witness2}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}