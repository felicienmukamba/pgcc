"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Skull, Calendar, MapPin, User, UserPlus } from "lucide-react"
import Link from "next/link"
import { RoleGuard } from "@/components/auth/role-guard"

interface DeathRecord {
  id: string
  deathPlace: string
  deathDate: string
  informantRelationship: string
  funeralPlace?: string
  cemeteryName?: string
  citizen: {
    firstName: string
    lastName: string
  }
  declarer: {
    username: string
  }
  officiant: {
    username: string
  }
}

export default async function DeathRecordsPage() {
  const [deathRecords, setDeathRecords] = useState<DeathRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")


  useEffect(() => {
    fetchDeathRecords()
  }, [])

  const fetchDeathRecords = async () => {
    try {
      const response = await fetch("/api/death-records")
      if (response.ok) {
        const data = await response.json()
        setDeathRecords(data)
      }
    } catch (error) {
      console.error("Error fetching death records:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = deathRecords.filter(
    (record) =>
      record.citizen.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.citizen.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.deathPlace.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
          <h1 className="text-3xl font-bold text-foreground">Actes de Décès</h1>
          <p className="text-muted-foreground">Gestion des actes de décès et enregistrements mortuaires</p>
        </div>
          <RoleGuard permission="citizens.write">
            <Link href="/dashboard/death-records/new">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Nouveau Acte de décès
              </Button>
            </Link>
          </RoleGuard>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par nom du défunt ou lieu de décès..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Death Records List */}
      <div className="grid gap-4">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skull className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">
                      {record.citizen.firstName} {record.citizen.lastName}
                    </h3>
                    <Badge variant="secondary">Décédé(e)</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(record.deathDate).toLocaleDateString("fr-FR")}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{record.deathPlace}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Déclarant: {record.declarer.username}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-medium">Relation:</span>
                      <span>{record.informantRelationship}</span>
                    </div>

                    {record.cemeteryName && (
                      <div className="flex items-center gap-2 col-span-2">
                        <span className="font-medium">Cimetière:</span>
                        <span>{record.cemeteryName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Skull className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun acte de décès trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Aucun résultat pour votre recherche." : "Commencez par créer un nouvel acte de décès."}
            </p>
            <Button asChild>
              <Link href="/dashboard/death-records/new">
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
