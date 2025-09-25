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
  ChevronRight, // Import the Chevron icon
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
      { name: "Actes de naissance", href: "/dashboard/birth-records", icon: Baby, requiredPermission: "citizens.read" },
      { name: "Actes de mariage", href: "/dashboard/marriage-records", icon: HeartHandshake, requiredPermission: "citizens.read" },
      { name: "Actes de décès", href: "/dashboard/death-records", icon: Skull, requiredPermission: "citizens.read" },
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
        <h2 className="sr-only">SGC</h2>
      </div>
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 py-4">
          {navigation.map((item) => {
            const role = session?.user?.roles as Role | undefined

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
                      {item.children.map((child) => {
                        if (
                          role &&
                          child.requiredPermission &&
                          !hasPermission(role, child.requiredPermission)
                        ) {
                          return null
                        }
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