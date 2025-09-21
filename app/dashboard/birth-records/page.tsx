"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FileText, Calendar, MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface BirthRecord {
  id: string
  registrationNumber: string
  childName: string
  gender: string
  birthDate: string
  birthPlace: string
  date: string
  citizen: {
    firstName: string
    lastName: string
  }
  officiant: {
    username: string
  }
}

export default function BirthRecordsPage() {
  const [birthRecords, setBirthRecords] = useState<BirthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const router = useRouter(); 

  useEffect(() => {
    fetchBirthRecords()
  }, [])

  const fetchBirthRecords = async () => {
    try {
      const response = await fetch("/api/birth-records")
      if (response.ok) {
        const data = await response.json()
        setBirthRecords(data)
      }
    } catch (error) {
      console.error("Error fetching birth records:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = birthRecords.filter((record) =>
    (record.childName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.registrationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.birthPlace || '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Actes de Naissance</h1>
          <p className="text-muted-foreground">Gestion des actes de naissance et enregistrements civils</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/birth-records/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Acte
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, numéro d'enregistrement ou lieu de naissance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Birth Records List */}
      <div className="grid gap-4">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{record.childName}</h3>
                    <Badge variant="outline">{record.gender}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">N° Enregistrement:</span>
                      <span>{record.registrationNumber}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(record.birthDate).toLocaleDateString("fr-FR")}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{record.birthPlace}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium">Officiant:</span>
                      <span>{record.officiant.username}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Enregistré le {new Date(record.date).toLocaleDateString("fr-FR")}
                  </p>
                  <p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.push(`/dashboard/birth-records/${record.id}`)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Voir plus
                      </Button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun acte de naissance trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Aucun résultat pour votre recherche." : "Commencez par créer un nouvel acte de naissance."}
            </p>
            <Button asChild>
              <Link href="/dashboard/birth-records/new">
                <Plus className="h-4 w-4 mr-2" />
                Créer un Acte
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
