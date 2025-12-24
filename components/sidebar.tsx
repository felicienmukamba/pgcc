"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
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
  UserMinus,
  Stethoscope,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react"

const navigation = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    icon: Home,
  },
  {
    group: "ADMINISTRATION",
    items: [
      {
        name: "Identités",
        icon: Users,
        module: "citizens",
        children: [
          { name: "Annuaire Citoyen", href: "/dashboard/citizens", icon: Users },
          { name: "Enrôlement", href: "/dashboard/citizens/new", icon: UserPlus },
        ],
      },
      {
        name: "État Civil",
        icon: FileText,
        module: "citizens",
        children: [
          { name: "Naissances", href: "/dashboard/birth-records", icon: Baby },
          { name: "Mariages", href: "/dashboard/marriage-records", icon: HeartHandshake },
          { name: "Divorces", href: "/dashboard/divorce-records", icon: UserMinus },
          { name: "Décès", href: "/dashboard/death-records", icon: Skull },
        ],
      },
    ]
  },
  {
    group: "SERVICES",
    items: [
      {
        name: "Santé",
        icon: Heart,
        module: "consultations",
        children: [
          { name: "Consultations", href: "/dashboard/consultations" },
          { name: "Examens Médicaux", href: "/dashboard/medical-exams", icon: Stethoscope },
          { name: "Prescriptions", href: "/dashboard/prescriptions" },
        ],
      },
      {
        name: "Justice",
        icon: Shield,
        module: "complaints",
        children: [
          { name: "Plaintes", href: "/dashboard/complaints" },
          { name: "Casier Judiciaire", href: "/dashboard/convictions" },
        ],
      },
      {
        name: "Biométrie",
        href: "/dashboard/biometric",
        icon: Scan,
        module: "biometric",
      },
    ]
  },
  {
    group: "SYSTEME",
    items: [
      {
        name: "Configuration",
        icon: Settings,
        module: "users",
        children: [
          { name: "Utilisateurs", href: "/dashboard/users", icon: Users },
          { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
        ],
      },
    ]
  }
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<string[]>(["ADMINISTRATION", "SERVICES", "SYSTEME", "Identités", "État Civil", "Santé", "Justice", "Configuration"])
  const { data: session } = useSession()

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => (prev.includes(name) ? prev.filter((group) => group !== name) : [...prev, name]))
  }

  const userRole = session?.user?.roles?.[0] as Role

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-slate-950 text-slate-300 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 to-transparent pointer-events-none" />

      {/* Official Header */}
      <div className="flex flex-col border-b border-slate-800/60 pb-4 pt-6 px-6 relative z-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/40 ring-1 ring-blue-500/50">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter text-white block leading-none">PGCC</span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block mt-0.5">RDC - GOV</span>
          </div>
        </div>
        <div className="h-0.5 w-12 bg-yellow-500 rounded-full mt-3 opacity-80" />
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {navigation.map((section, idx) => (
            <div key={idx} className="space-y-2">
              {section.group && (
                <h3 className="px-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  {section.group}
                </h3>
              )}

              <div className="space-y-1">
                {(section.items || [section]).map((item: any) => {
                  if (item.module && userRole && !canAccessModule(userRole, item.module)) {
                    return null
                  }

                  const isActive = pathname === item.href || (item.children?.some((child: any) => pathname === child.href))
                  const isOpen = openGroups.includes(item.name)

                  if (item.children) {
                    return (
                      <div key={item.name} className="space-y-1">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between hover:bg-slate-900 hover:text-white group px-4 py-2 h-10 transition-all border-l-4 border-transparent",
                            isActive ? "text-white bg-slate-900 font-semibold border-l-4 border-yellow-500 shadow-md shadow-black/20" : "text-slate-400"
                          )}
                          onClick={() => toggleGroup(item.name)}
                        >
                          <div className="flex items-center">
                            <item.icon className={cn("mr-3 h-4 w-4 transition-colors", isActive ? "text-primary" : "group-hover:text-white")} />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <ChevronDown className={cn("h-3 w-3 transition-transform duration-200 opacity-50", isOpen && "rotate-180")} />
                        </Button>

                        {isOpen && (
                          <div className="ml-4 pl-4 border-l border-slate-800 space-y-1 mt-1">
                            {item.children.map((child: any) => (
                              <Link key={child.href} href={child.href}>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start text-xs h-9 px-3 hover:bg-slate-900 hover:text-white",
                                    pathname === child.href ? "text-primary bg-slate-900 font-medium" : "text-slate-500"
                                  )}
                                >
                                  {child.icon && <child.icon className="mr-3 h-3.5 w-3.5" />}
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
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start hover:bg-slate-900 hover:text-white group px-4 py-2 h-10 transition-all border-l-4 border-transparent",
                          pathname === item.href ? "text-white bg-slate-900 font-semibold border-l-4 border-blue-500 shadow-md shadow-black/20" : "text-slate-400"
                        )}
                      >
                        <item.icon className={cn("mr-3 h-4 w-4 transition-colors", pathname === item.href ? "text-primary" : "group-hover:text-white")} />
                        <span className="text-sm">{item.name}</span>
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-auto border-t border-slate-800 p-4 bg-slate-950/50">
        <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 ring-2 ring-slate-800 ring-offset-2 ring-offset-slate-950">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{session?.user?.username || "Utilisateur"}</p>
            <p className="text-[10px] text-slate-500 font-bold truncate uppercase tracking-tighter">{userRole || "Invité"}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className={cn("hidden border-r bg-slate-950 text-white lg:block lg:w-64", className)}>
        <SidebarContent />
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden absolute top-4 left-4 z-50 bg-slate-950 border-slate-800 text-white hover:bg-slate-900">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 border-r-slate-800">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
