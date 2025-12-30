"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function ConvictionDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la Condamnation</CardTitle>
          <CardDescription>ID: {params.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Page en cours de réparation...</p>
        </CardContent>
      </Card>
    </div>
  )
}