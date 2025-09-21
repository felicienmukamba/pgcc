"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Search } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

// Interfaces pour le modèle de données
interface Citizen {
  id: string;
  firstName: string;
  lastName: string;
  nationalityID: string;
  birthDate: string;
}

export default function NewConvictionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCitizens, setFilteredCitizens] = useState<Citizen[]>([]);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);

  const [formData, setFormData] = useState({
    citizenId: "",
    offense: "",
    court: "",
    judgmentDate: "",
    sentence: "",
    sentenceType: "FINE",
    status: "ACTIVE",
    appealStatus: "NONE",
    observations: "",
  });

  // Fonction de recherche débouncée pour éviter trop de requêtes
  const filterCitizens = useCallback((query: string) => {
    if (!query) {
      setFilteredCitizens([]);
      return;
    }
    const lowerCaseQuery = query.toLowerCase();
    const results = citizens.filter(citizen => 
      citizen.firstName.toLowerCase().includes(lowerCaseQuery) ||
      citizen.lastName.toLowerCase().includes(lowerCaseQuery) ||
      citizen.nationalityID.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredCitizens(results);
  }, [citizens]);

  useEffect(() => {
    const fetchCitizens = async () => {
      try {
        const response = await fetch("/api/citizens");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des citoyens");
        }
        const data = await response.json();
        setCitizens(data);
      } catch (error) {
        console.error("Failed to fetch citizens:", error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger la liste des citoyens.",
          variant: "destructive",
        });
      }
    };
    fetchCitizens();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      filterCitizens(searchQuery);
    }, 300); // Déclenche le filtrage 300ms après la dernière frappe

    return () => clearTimeout(handler);
  }, [searchQuery, filterCitizens]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedCitizen) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner un citoyen avant de continuer.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/convictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, citizenId: selectedCitizen.id }),
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Condamnation enregistrée avec succès",
        });
        router.push("/dashboard/convictions");
      } else {
        throw new Error("Erreur lors de la création");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la condamnation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/convictions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gov-primary">Nouvelle Condamnation</h1>
          <p className="text-muted-foreground">Enregistrer une nouvelle condamnation</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la Condamnation</CardTitle>
          <CardDescription>Remplissez tous les champs requis pour enregistrer la condamnation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Citizen Selection */}
            <div className="space-y-4">
              <Label>Citoyen *</Label>
              {!selectedCitizen ? (
                <>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Rechercher par nom, prénom ou ID national..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="button" variant="outline" className="shrink-0">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  {searchQuery && filteredCitizens.length > 0 && (
                    <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border p-2">
                      {filteredCitizens.map((citizen) => (
                        <div
                          key={citizen.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => {
                            setSelectedCitizen(citizen);
                            setFormData((prev) => ({ ...prev, citizenId: citizen.id }));
                            setSearchQuery("");
                          }}
                        >
                          <div className="font-medium">
                            {citizen.firstName} {citizen.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {citizen.nationalityID} • Né(e) le{" "}
                            {new Date(citizen.birthDate).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchQuery && filteredCitizens.length === 0 && (
                    <div className="p-3 text-sm text-muted-foreground">Aucun citoyen trouvé.</div>
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCitizen(null);
                      setFormData((prev) => ({ ...prev, citizenId: "" }));
                    }}
                  >
                    Retirer
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="offense">Infraction *</Label>
              <Textarea
                id="offense"
                value={formData.offense}
                onChange={(e) => setFormData((prev) => ({ ...prev, offense: e.target.value }))}
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="court">Tribunal *</Label>
                <Input
                  id="court"
                  value={formData.court}
                  onChange={(e) => setFormData((prev) => ({ ...prev, court: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="judgmentDate">Date du jugement *</Label>
                <Input
                  id="judgmentDate"
                  type="date"
                  value={formData.judgmentDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, judgmentDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sentence">Sentence *</Label>
              <Textarea
                id="sentence"
                value={formData.sentence}
                onChange={(e) => setFormData((prev) => ({ ...prev, sentence: e.target.value }))}
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sentenceType">Type de sentence *</Label>
                <Select
                  value={formData.sentenceType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, sentenceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FINE">Amende</SelectItem>
                    <SelectItem value="IMPRISONMENT">Emprisonnement</SelectItem>
                    <SelectItem value="COMMUNITY_SERVICE">Service communautaire</SelectItem>
                    <SelectItem value="PROBATION">Probation</SelectItem>
                    <SelectItem value="SUSPENDED">Sursis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Statut *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Actif</SelectItem>
                    <SelectItem value="COMPLETED">Terminé</SelectItem>
                    <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appealStatus">Statut d'appel</Label>
                <Select
                  value={formData.appealStatus}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, appealStatus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Aucun</SelectItem>
                    <SelectItem value="PENDING">En cours</SelectItem>
                    <SelectItem value="ACCEPTED">Accepté</SelectItem>
                    <SelectItem value="REJECTED">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observations</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData((prev) => ({ ...prev, observations: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/convictions">
                <Button variant="outline" type="button">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
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