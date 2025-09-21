// types de permissions disponibles
export type Permission =
  | "citizens.read"
  | "citizens.write"
  | "citizens.delete"
  | "consultations.read"
  | "consultations.write"
  | "consultations.delete"
  | "prescriptions.read"
  | "prescriptions.write"
  | "prescriptions.delete"
  | "complaints.read"
  | "complaints.write"
  | "complaints.delete"
  | "convictions.read"
  | "convictions.write"
  | "convictions.delete"
  | "biometric.read"
  | "biometric.write"
  | "users.read"
  | "users.write"
  | "users.delete"
  | "admin.all"

// rôles RBAC utilisés côté code
export type Role =
  | "ADMIN"
  | "CIVIL_SERVANT"
  | "MEDICAL_STAFF"
  | "SECURITY_STAFF"
  | "VIEWER"

// mapping Prisma enum -> RBAC type
const PRISMA_TO_RBAC: Record<string, Role> = {
  ADMIN: "ADMIN",
  MEDECIN: "MEDICAL_STAFF",
  PROCUREUR: "SECURITY_STAFF",
  OPJ: "SECURITY_STAFF",
  OFFICIER_ETAT_CIVIL: "CIVIL_SERVANT",
  CITOYEN: "VIEWER",
}

// permissions par rôle RBAC
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: ["admin.all"],
  CIVIL_SERVANT: ["citizens.read", "citizens.write", "citizens.delete", "biometric.read", "biometric.write"],
  MEDICAL_STAFF: [
    "citizens.read",
    "consultations.read",
    "consultations.write",
    "consultations.delete",
    "prescriptions.read",
    "prescriptions.write",
    "prescriptions.delete",
    "biometric.read",
  ],
  SECURITY_STAFF: [
    "citizens.read",
    "complaints.read",
    "complaints.write",
    "complaints.delete",
    "convictions.read",
    "convictions.write",
    "convictions.delete",
    "biometric.read",
    "biometric.write",
  ],
  VIEWER: [
    "citizens.read",
    "consultations.read",
    "prescriptions.read",
    "complaints.read",
    "convictions.read",
    "biometric.read",
  ],
}

/**
 * Vérifie si le rôle a une permission spécifique
 * @param userRole rôle venant de la base Prisma (ex: "MEDECIN")
 * @param permission permission à vérifier
 */
export function hasPermission(userRole: string, permission: Permission): boolean {
  const rbacRole = PRISMA_TO_RBAC[userRole]
  if (!rbacRole) return false
  const permissions = ROLE_PERMISSIONS[rbacRole] || []
  return permissions.includes("admin.all") || permissions.includes(permission)
}

/**
 * Vérifie si le rôle peut accéder à un module spécifique
 * @param userRole rôle venant de la base Prisma
 * @param module nom du module ("citizens", "consultations", ...)
 */
export function canAccessModule(userRole: string, module: string): boolean {
  switch (module) {
    case "citizens":
      return hasPermission(userRole, "citizens.read")
    case "consultations":
      return hasPermission(userRole, "consultations.read")
    case "prescriptions":
      return hasPermission(userRole, "prescriptions.read")
    case "complaints":
      return hasPermission(userRole, "complaints.read")
    case "convictions":
      return hasPermission(userRole, "convictions.read")
    case "biometric":
      return hasPermission(userRole, "biometric.read")
    case "users":
      return hasPermission(userRole, "users.read")
    default:
      return false
  }
}
