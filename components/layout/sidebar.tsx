"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { canAccessModule, hasPermission, type Role, type Permission } from "@/lib/rbac"
import { RoleGuard } from "@/components/auth/role-guard" // Assurez-vous d'importer RoleGuard
import {
  Users,
  FileText,
  Heart,
  Shield,
  Settings,
  Menu,
  Home,
  UserPlus,
  Baby,
  HeartHandshake,
  Skull,
  Scan,
  ChevronRight,
  Plus, // N'oubliez pas d'importer l'icône Plus
} from "lucide-react"

interface NavItem {
  name: string
  href?: string
  icon?: any
  module?: string
  requiredPermission?: Permission
  children?: NavItem[]
}

const navigation: NavItem[] = [
  { name: "Tableau de bord", href: "/dashboard", icon: Home },
  {
    name: "Gestion d'identité",
    icon: Users,
    module: "citizens",
    children: [
      { name: "Citoyens", href: "/dashboard/citizens", icon: Users, requiredPermission: "citizens.read" },
      { name: "Nouveau citoyen", href: "/dashboard/citizens/new", icon: UserPlus, requiredPermission: "citizens.write" },
    ],
  },
  {
    name: "État civil",
    icon: FileText,
    module: "citizens",
    children: [
      { name: "Actes de naissance", href: "/dashboard/birth-records", icon: Baby, requiredPermission: "birth.read" },
      { name: "Actes de mariage", href: "/dashboard/marriage-records", icon: HeartHandshake, requiredPermission: "marriage.read" },
      { name: "Actes de décès", href: "/dashboard/death-records", icon: Skull, requiredPermission: "death.read" },
    ],
  },
  {
    name: "Santé",
    href: "/dashboard/health",
    icon: Heart,
    module: "consultations",
    children: [
      { name: "Consultations", href: "/dashboard/consultations", requiredPermission: "consultations.read" },
      { name: "Prescriptions", href: "/dashboard/prescriptions", requiredPermission: "prescriptions.read" },
    ],
  },
  {
    name: "Sécurité & Justice",
    href: "/dashboard/security",
    icon: Shield,
    module: "complaints",
    children: [
      { name: "Plaintes", href: "/dashboard/complaints", requiredPermission: "complaints.read" },
      { name: "Casier judiciaire", href: "/dashboard/convictions", requiredPermission: "convictions.read" },
    ],
  },
  { name: "Biométrie", href: "/dashboard/biometric", icon: Scan, module: "biometric", requiredPermission: "biometric.read" },
  {
    name: "Administration",
    icon: Settings,
    module: "users",
    children: [
      { name: "Utilisateurs", href: "/dashboard/users", icon: Users, requiredPermission: "users.read" },
    ],
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<string[]>([])
  const { data: session } = useSession()

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) =>
      prev.includes(name) ? prev.filter((group) => group !== name) : [...prev, name]
    )
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <img
          src="/img/logocongo.png"
          alt="SGC logo"
          className="h-10 w-auto object-contain"
        />
        <div className="ml-3 flex flex-col">
          <h2 className="text-lg font-semibold leading-none">SGC</h2>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 py-4">
          {navigation.map((item) => {
            const role = session?.user?.roles[0] as Role | undefined // Assurez-vous de récupérer le rôle correctement (e.g., le premier)

            if (!role) {
                // Si l'utilisateur n'est pas connecté ou n'a pas de rôle, on ne montre rien
                // Sauf si l'élément de navigation ne nécessite pas de permission/module (comme le Tableau de bord)
                if (!item.module && !item.requiredPermission) {
                    // Continue pour afficher le Tableau de bord
                } else {
                    return null
                }
            }


            if (
              (item.module && role && !canAccessModule(role, item.module)) ||
              (item.requiredPermission && role && !hasPermission(role, item.requiredPermission))
            ) {
              return null
            }

            if (item.children) {
              // Check if any child is active
              const isChildActive = item.children?.some((child) => pathname.startsWith(child.href!))
              const isOpen = openGroups.includes(item.name) || isChildActive

              // Filtrer les enfants qui n'ont pas la permission
              const visibleChildren = item.children.filter(child => 
                  !child.requiredPermission || !role || hasPermission(role, child.requiredPermission)
              );
              
              // Si le groupe n'a pas d'enfants visibles, on ne l'affiche pas (sauf si c'est le Tableau de bord)
              if (item.name !== "Tableau de bord" && visibleChildren.length === 0 && !isOpen) {
                  return null;
              }


              return (
                <div key={item.name}>
                  <Button
                    variant={isChildActive ? "secondary" : "ghost"}
                    className="w-full justify-start font-semibold"
                    onClick={() => toggleGroup(item.name)}
                    aria-expanded={isOpen}
                  >
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    <span className="flex-1 text-left">{item.name}</span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        isOpen && "rotate-90"
                      )}
                    />
                  </Button>
                  {isOpen && (
                    <div className="ml-6 space-y-1 p-1 rounded-sm bg-muted/30">
                      {visibleChildren.map((child) => {
                        // La vérification de permission a déjà été faite dans visibleChildren
                        return (
                          <Link key={child.href} href={child.href!}>
                            <Button
                              variant={pathname.startsWith(child.href!) ? "secondary" : "ghost"}
                              className="w-full justify-start text-sm"
                            >
                              {child.icon && <child.icon className="mr-2 h-3 w-3" />}
                              {child.name}
                            </Button>
                          </Link>
                        )
                      })}

                      {/* AJOUT DU BOUTON CONDITIONNEL 'Nouvelle Consultation' */}
                      {item.name === "Santé" && (
                        <RoleGuard permission="consultations.write">
                          <Link href="/dashboard/consultations/new">
                            <Button
                              variant="ghost" // Utilisez 'ghost' pour le style
                              className="w-full justify-start text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-500"
                            >
                              <Plus className="mr-2 h-3 w-3" />
                              Nouvelle consultation
                            </Button>
                          </Link>
                        </RoleGuard>
                      )}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link key={item.name} href={item.href!}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start font-semibold"
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden border-r bg-sidebar lg:block lg:w-64", className)}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden bg-transparent">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}