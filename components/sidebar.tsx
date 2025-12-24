"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  ChevronRight,
  LogOut,
  User,
  Activity,
  Scale,
  ClipboardList,
  Pill,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
  Fingerprint,
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
          { name: "Consultations", href: "/dashboard/consultations", icon: Activity },
          { name: "Examens Médicaux", href: "/dashboard/medical-exams", icon: Stethoscope },
          { name: "Prescriptions", href: "/dashboard/prescriptions", icon: Pill },
        ],
      },
      {
        name: "Justice",
        icon: Scale,
        module: "complaints",
        children: [
          { name: "Plaintes", href: "/dashboard/complaints", icon: ClipboardList },
          { name: "Casier Judiciaire", href: "/dashboard/convictions", icon: Shield },
        ],
      },
      {
        name: "Biométrie",
        href: "/dashboard/biometric",
        icon: Fingerprint,
        module: "biometric",
      },
    ]
  },
  {
    group: "SYSTÈME",
    items: [
      {
        name: "Configuration",
        icon: Settings,
        module: "users",
        children: [
          { name: "Utilisateurs", href: "/dashboard/users", icon: Users },
          { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
          { name: "Journal d'Audit", href: "/dashboard/audit", icon: ShieldCheck },
          { name: "Intégrité Audit", href: "/dashboard/audit/integrity", icon: Shield },
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
  const [openGroups, setOpenGroups] = useState<string[]>(["Identités", "État Civil", "Santé", "Justice", "Configuration"])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { data: session } = useSession()

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => (prev.includes(name) ? prev.filter((group) => group !== name) : [...prev, name]))
  }

  const userRole = session?.user?.roles?.[0] as Role

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-300 relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-blue-600/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className={cn(
        "relative z-10 border-b border-slate-800/50",
        collapsed ? "py-4 px-2" : "py-5 px-5"
      )}>
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <div className={cn(
            "relative rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/30",
            collapsed ? "h-10 w-10" : "h-11 w-11"
          )}>
            <Shield className={collapsed ? "h-5 w-5" : "h-6 w-6"} />
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <h1 className="text-lg font-black tracking-tight text-white">PGCC</h1>
              <p className="text-[10px] text-blue-400/80 font-semibold uppercase tracking-widest">
                RDC • Système National
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="flex gap-1 mt-3">
            <div className="h-1 w-8 rounded-full bg-blue-500" />
            <div className="h-1 w-4 rounded-full bg-yellow-400" />
            <div className="h-1 w-2 rounded-full bg-red-400" />
          </div>
        )}
      </div>

      {/* Collapse Toggle (Desktop Only) */}
      {!collapsed && (
        <button
          onClick={() => setIsCollapsed(true)}
          className="hidden lg:flex absolute top-5 right-3 z-20 h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navigation.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.group && !collapsed && (
                <h3 className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-widest text-slate-500/80 uppercase">
                  {section.group}
                </h3>
              )}
              {section.group && collapsed && (
                <div className="h-px bg-slate-800 mx-2 my-2" />
              )}

              <div className="space-y-0.5">
                {(section.items || [section]).map((item: any) => {
                  if (item.module && userRole && !canAccessModule(userRole, item.module)) {
                    return null
                  }

                  const isActive = pathname === item.href || (item.children?.some((child: any) => pathname === child.href))
                  const isOpen = openGroups.includes(item.name)
                  const ItemIcon = item.icon

                  // Collapsed mode with tooltip
                  if (collapsed) {
                    if (item.children) {
                      return (
                        <TooltipProvider key={item.name} delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => toggleGroup(item.name)}
                                className={cn(
                                  "w-full flex items-center justify-center h-10 rounded-lg transition-all",
                                  isActive
                                    ? "bg-blue-600/20 text-blue-400"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                              >
                                <ItemIcon className="h-5 w-5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                              <p className="font-medium">{item.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    }
                    return (
                      <TooltipProvider key={item.name} delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              className={cn(
                                "w-full flex items-center justify-center h-10 rounded-lg transition-all",
                                pathname === item.href
                                  ? "bg-blue-600/20 text-blue-400"
                                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                              )}
                            >
                              <ItemIcon className="h-5 w-5" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                            <p className="font-medium">{item.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  }

                  // Expanded mode
                  if (item.children) {
                    return (
                      <div key={item.name} className="space-y-0.5">
                        <button
                          onClick={() => toggleGroup(item.name)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group",
                            isActive
                              ? "bg-slate-800/80 text-white"
                              : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                              isActive
                                ? "bg-blue-600/20 text-blue-400"
                                : "bg-slate-800/50 text-slate-500 group-hover:bg-slate-800 group-hover:text-slate-300"
                            )}>
                              <ItemIcon className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <ChevronRight className={cn(
                            "h-4 w-4 text-slate-600 transition-transform duration-200",
                            isOpen && "rotate-90"
                          )} />
                        </button>

                        <div className={cn(
                          "overflow-hidden transition-all duration-200",
                          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        )}>
                          <div className="ml-5 pl-4 border-l border-slate-800/50 space-y-0.5 py-1">
                            {item.children.map((child: any) => {
                              const ChildIcon = child.icon || FileText
                              const isChildActive = pathname === child.href
                              return (
                                <Link key={child.href} href={child.href}>
                                  <div className={cn(
                                    "flex items-center gap-2.5 px-3 py-2 rounded-md transition-all text-sm",
                                    isChildActive
                                      ? "bg-blue-600/10 text-blue-400 font-medium"
                                      : "text-slate-500 hover:bg-slate-800/30 hover:text-slate-300"
                                  )}>
                                    <ChildIcon className="h-3.5 w-3.5" />
                                    <span>{child.name}</span>
                                    {isChildActive && (
                                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
                                    )}
                                  </div>
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <Link key={item.name} href={item.href}>
                      <div className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                        pathname === item.href
                          ? "bg-slate-800/80 text-white"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                      )}>
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                          pathname === item.href
                            ? "bg-blue-600/20 text-blue-400"
                            : "bg-slate-800/50 text-slate-500 group-hover:bg-slate-800 group-hover:text-slate-300"
                        )}>
                          <ItemIcon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">{item.name}</span>
                        {pathname === item.href && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-blue-400" />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className={cn(
        "border-t border-slate-800/50 bg-slate-950/50",
        collapsed ? "p-2" : "p-4"
      )}>
        {collapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => signOut()}
                  className="w-full h-10 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                <p>Déconnexion</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/50 backdrop-blur-sm">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                {(session?.user?.username || "U")[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {session?.user?.username || "Utilisateur"}
              </p>
              <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-wider">
                {userRole || "Invité"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  // Collapsed desktop sidebar
  if (isCollapsed) {
    return (
      <>
        <div className={cn("hidden lg:block lg:w-16 border-r border-slate-800", className)}>
          <div className="relative h-full">
            <button
              onClick={() => setIsCollapsed(false)}
              className="absolute top-5 left-1/2 -translate-x-1/2 z-20 h-7 w-7 flex items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <SidebarContent collapsed={true} />
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden fixed top-4 left-4 z-50 bg-slate-900 border-slate-700 text-white hover:bg-slate-800">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-r-slate-800 bg-slate-900">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <>
      <div className={cn("hidden border-r border-slate-800 lg:block lg:w-72", className)}>
        <SidebarContent />
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden fixed top-4 left-4 z-50 bg-slate-900 border-slate-700 text-white hover:bg-slate-800">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 border-r-slate-800 bg-slate-900">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
