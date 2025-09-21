"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { hasPermission, canAccessModule, type Permission, type Role } from "@/lib/rbac"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldX } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  permission?: Permission
  module?: string
  fallback?: React.ReactNode
}

export function RoleGuard({ children, permission, module, fallback }: RoleGuardProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="flex items-center justify-center p-8">Chargement...</div>
  }

  if (!session?.user) {
    return (
      fallback || (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>Vous devez être connecté pour accéder à cette ressource.</AlertDescription>
        </Alert>
      )
    )
  }

  const userRole = session.user.role as Role

  // Check specific permission
  if (permission && !hasPermission(userRole, permission)) {
    return (
      fallback || (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>
            Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.
          </AlertDescription>
        </Alert>
      )
    )
  }

  // Check module access
  if (module && !canAccessModule(userRole, module)) {
    return (
      fallback || (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>Vous n'avez pas accès à ce module.</AlertDescription>
        </Alert>
      )
    )
  }

  return <>{children}</>
}
