"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { canAccessModule, type Role } from "@/lib/rbac"
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
} from "lucide-react"

const navigation = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Gestion d'identité",
    icon: Users,
    module: "citizens",
    children: [
      { name: "Citoyens", href: "/dashboard/citizens", icon: Users },
      { name: "Nouveau citoyen", href: "/dashboard/citizens/new", icon: UserPlus },
    ],
  },
  {
    name: "État civil",
    icon: FileText,
    module: "citizens",
    children: [
      { name: "Actes de naissance", href: "/dashboard/birth-records", icon: Baby },
      { name: "Actes de mariage", href: "/dashboard/marriage-records", icon: HeartHandshake },
      { name: "Actes de décès", href: "/dashboard/death-records", icon: Skull },
    ],
  },
  {
    name: "Santé",
    href: "/dashboard/health",
    icon: Heart,
    module: "consultations",
    children: [
      { name: "Consultations", href: "/dashboard/consultations" },
      { name: "Prescriptions", href: "/dashboard/prescriptions" },
    ],
  },
  {
    name: "Sécurité & Justice",
    href: "/dashboard/security",
    icon: Shield,
    module: "complaints",
    children: [
      { name: "Plaintes", href: "/dashboard/complaints" },
      { name: "Casier judiciaire", href: "/dashboard/convictions" },
    ],
  },
  {
    name: "Biométrie",
    href: "/dashboard/biometric",
    icon: Scan,
    module: "biometric",
  },
  {
    name: "Administration",
    icon: Settings,
    module: "users",
    children: [
      { name: "Utilisateurs", href: "/dashboard/users", icon: Users },
      { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
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
    setOpenGroups((prev) => (prev.includes(name) ? prev.filter((group) => group !== name) : [...prev, name]))
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold text-primary">SGC</h2>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {navigation.map((item) => {
            if (item.module && session?.user?.role && !canAccessModule(session.user.role as Role, item.module)) {
              return null
            }

            if (item.children) {
              const isOpen = openGroups.includes(item.name)
              return (
                <div key={item.name}>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => toggleGroup(item.name)}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                  {isOpen && (
                    <div className="ml-6 space-y-1">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href}>
                          <Button
                            variant={pathname === child.href ? "secondary" : "ghost"}
                            className="w-full justify-start text-sm"
                          >
                            {child.icon && <child.icon className="mr-2 h-3 w-3" />}
                            {child.name}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link key={item.name} href={item.href}>
                <Button variant={pathname === item.href ? "secondary" : "ghost"} className="w-full justify-start">
                  <item.icon className="mr-2 h-4 w-4" />
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
