"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, HeartHandshake, Calendar, MapPin, Users, UserPlus } from "lucide-react"
import Link from "next/link"

import { RoleGuard } from "@/components/auth/role-guard"

interface MarriageRecord {
  id: string
  marriagePlace: string
  marriageDate: string
  marriageType: string
  contractType?: string
  partner1: {
    firstName: string
    lastName: string
  }
  partner2: {
    firstName: string
    lastName: string
  }
  officiant: {
    username: string
  }
}

export default async function MarriageRecordsPage() {
  const [marriageRecords, setMarriageRecords] = useState<MarriageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")


  useEffect(() => {
    fetchMarriageRecords()
  }, [])

  const fetchMarriageRecords = async () => {
    try {
      const response = await fetch("/api/marriage-records")
      if (response.ok) {
        const data = await response.json()
        setMarriageRecords(data)
      }
    } catch (error) {
      console.error("Error fetching marriage records:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = marriageRecords.filter(
    (record) =>
      record.partner1.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.partner1.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.partner2.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.partner2.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.marriagePlace.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <h1 className="text-3xl font-bold text-foreground">Actes de Mariage</h1>
          <p className="text-muted-foreground">Gestion des actes de mariage et unions civiles</p>
        </div>
          <RoleGuard permission="citizens.write">
            <Link href="/dashboard/marriage-records/new">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Nouvel Acte
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
              placeholder="Rechercher par nom des époux ou lieu de mariage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Marriage Records List */}
      <div className="grid gap-4">
        {filteredRecords.map((record) => (
          <Link href={`/dashboard/marriage-records/${record.id}`} key={record.id}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">
                        {record.partner1.firstName} {record.partner1.lastName} & {record.partner2.firstName}{" "}
                        {record.partner2.lastName}
                      </h3>
                      <Badge variant="outline">{record.marriageType}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(record.marriageDate).toLocaleDateString("fr-FR")}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{record.marriagePlace}</span>
                      </div>

                      {record.contractType && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Régime:</span>
                          <span>{record.contractType}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Officier: {record.officiant.username}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="flex-shrink-0">
                    Voir plus
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <HeartHandshake className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun acte de mariage trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Aucun résultat pour votre recherche." : "Commencez par créer un nouvel acte de mariage."}
            </p>
            <Button asChild>
              <Link href="/dashboard/marriage-records/new">
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