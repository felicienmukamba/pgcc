"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { canAccessModule, hasPermission, type Role, type Permission } from "@/lib/rbac"
import { RoleGuard } from "@/components/auth/role-guard"
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
  Plus,
  LogOut,
  MoreVertical,
  Fingerprint,
  HeartCrack,
  Stethoscope,
  Building2
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    name: "ADENTIFICATION", // Group Header styled differently
    href: "#",
    icon: null, // No icon for headers
    children: [
      {
        name: "Gestion d'identité",
        icon: Users,
        module: "citizens",
        children: [
          { name: "Citoyens", href: "/dashboard/citizens", icon: Users, requiredPermission: "citizens.read" },
          { name: "Nouveau citoyen", href: "/dashboard/citizens/new", icon: UserPlus, requiredPermission: "citizens.write" },
        ],
      },
      { name: "Biométrie", href: "/dashboard/biometric", icon: Fingerprint, module: "biometric", requiredPermission: "biometric.read" },
    ]
  },
  {
    name: "SERVICES CIVILS",
    href: "#",
    icon: null,
    children: [
      {
        name: "État civil",
        icon: FileText,
        module: "citizens",
        children: [
          { name: "Actes de naissance", href: "/dashboard/birth-records", icon: Baby, requiredPermission: "birth.read" },
          { name: "Actes de mariage", href: "/dashboard/marriage-records", icon: HeartHandshake, requiredPermission: "marriage.read" },
          { name: "Actes de divorce", href: "/dashboard/divorce-records", icon: HeartCrack, requiredPermission: "divorce.read" },
          { name: "Actes de décès", href: "/dashboard/death-records", icon: Skull, requiredPermission: "death.read" },
        ],
      },
    ]
  },
  {
    name: "SERVICES SPECIALISÉS",
    href: "#",
    icon: null,
    children: [
      {
        name: "Santé",
        href: "/dashboard/health",
        icon: Heart,
        module: "consultations",
        children: [
          { name: "Consultations", href: "/dashboard/consultations", icon: Stethoscope, requiredPermission: "consultations.read" },
          { name: "Examens médicaux", href: "/dashboard/medical-exams", icon: Stethoscope, requiredPermission: "exam.read" },
          { name: "Prescriptions", href: "/dashboard/prescriptions", icon: Stethoscope, requiredPermission: "prescriptions.read" },
        ],
      },
      {
        name: "Sécurité & Justice",
        href: "/dashboard/security",
        icon: Shield,
        module: "complaints",
        children: [
          { name: "Plaintes", href: "/dashboard/complaints", icon: Stethoscope, requiredPermission: "complaints.read" },
          { name: "Casier judiciaire", href: "/dashboard/convictions", icon: Stethoscope, requiredPermission: "convictions.read" },
        ],
      },
    ]
  },
  {
    name: "ESPACE ENTREPRISES",
    href: "#",
    icon: null,
    children: [
      {
        name: "API Entreprises",
        icon: Building2,
        module: "companies",
        children: [
          { name: "Vérification d'identité", href: "/dashboard/companies/verification", requiredPermission: "companies.verify" },
        ],
      },
    ]
  },
  {
    name: "SYSTÈME",
    href: "#",
    icon: null,
    children: [
      {
        name: "Administration",
        icon: Settings,
        module: "users",
        children: [
          { name: "Utilisateurs", href: "/dashboard/users", icon: Users, requiredPermission: "users.read" },
        ],
      },
    ]
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

  // To check active state accurately even for nested routes
  const isActive = (href?: string) => href && pathname.startsWith(href)

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar-background text-sidebar-foreground">
      {/* HEADER */}
      <div className="flex h-20 items-center border-b px-6 bg-gradient-to-r from-blue-900/10 to-transparent">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105">
            <img
              src="/img/logocongo.png"
              alt="SGC logo"
              className="h-full w-full object-contain p-1"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold leading-none text-primary tracking-tight">SGC</h2>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Rép. Dém. du Congo</span>
          </div>
        </Link>
      </div>

      {/* NAVIGATION */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4">
          {navigation.map((item, index) => {
            const role = session?.user?.roles[0] as Role | undefined

            // Logic to handle Group Headers vs Regular Items
            if (item.icon === null && item.children) {
              // THIS IS A SECTION HEADER (e.g., "SERVICES CIVILS")
              // Filter children based on permissions first
              const validChildren = item.children.filter(child => {
                if (!role) return false;
                // Check module access
                if (child.module && !canAccessModule(role, child.module)) return false;
                // Check specific permission
                if (child.requiredPermission && !hasPermission(role, child.requiredPermission)) return false;
                return true;
              });

              if (validChildren.length === 0) return null;

              return (
                <div key={index} className="space-y-1">
                  <h4 className="mb-2 mt-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {item.name}
                  </h4>
                  {validChildren.map(child => renderNavItem(child, role, openGroups, toggleGroup, pathname))}
                </div>
              )
            } else {
              // Regular Root Item (like Dashboard)
              return renderNavItem(item, role, openGroups, toggleGroup, pathname);
            }
          })}
        </div>
      </ScrollArea>

      {/* USER PROFILE FOOTER */}
      <div className="border-t p-4 bg-muted/20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-start gap-3 h-auto p-2 hover:bg-muted/50 transition-colors">
              <Avatar className="h-9 w-9 border shadow-sm">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${session?.user?.username || 'User'}`} />
                <AvatarFallback>{session?.user?.username?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start truncate text-left flex-1">
                <span className="text-sm font-medium truncate w-full">{session?.user?.username}</span>
                <span className="text-xs text-muted-foreground truncate w-full capitalize">
                  {session?.user?.roles[0]?.toLowerCase().replace(/_/g, " ")}
                </span>
              </div>
              <MoreVertical className="h-4 w-4 text-muted-foreground ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" side="top">
            <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <Users className="mr-2 h-4 w-4" />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <>
      <div className={cn("hidden border-r bg-card/50 backdrop-blur-xl lg:block lg:w-72 shadow-[1px_0_20px_0_rgba(0,0,0,0.05)]", className)}>
        <SidebarContent />
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden fixed top-4 left-4 z-40 bg-background/80 backdrop-blur-md shadow-sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 border-r bg-background/95 backdrop-blur-xl">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}

// Helper function to render items recursively
function renderNavItem(
  item: NavItem,
  role: Role | undefined,
  openGroups: string[],
  toggleGroup: (name: string) => void,
  pathname: string
) {
  if (!role && item.name !== "Tableau de bord") return null;

  // Permission check
  if (
    (item.module && role && !canAccessModule(role, item.module)) ||
    (item.requiredPermission && role && !hasPermission(role, item.requiredPermission))
  ) {
    return null
  }

  const isGroup = !!item.children;
  const isExpanded = openGroups.includes(item.name) || item.children?.some(c => pathname.startsWith(c.href!));
  const isActiveLink = !isGroup && item.href && pathname === item.href;
  const isChildrenActive = isGroup && item.children!.some(c => pathname.startsWith(c.href!));

  if (isGroup) {
    return (
      <div key={item.name} className="mb-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start font-medium h-10 px-3 hover:bg-muted/50",
            isChildrenActive ? "text-primary font-semibold" : "text-muted-foreground"
          )}
          onClick={() => toggleGroup(item.name)}
        >
          {item.icon && <item.icon className={cn("mr-3 h-4 w-4", isChildrenActive ? "text-primary" : "text-muted-foreground/70")} />}
          <span className="flex-1 text-left">{item.name}</span>
          <ChevronRight className={cn("h-4 w-4 transition-transform duration-200 text-muted-foreground/50", isExpanded && "rotate-90 text-primary")} />
        </Button>

        {isExpanded && (
          <div className="ml-4 mt-1 space-y-px border-l pl-3 border-border/40">
            {item.children!.map(child => renderNavItem(child, role, openGroups, toggleGroup, pathname))}

            {/* Specific Action Buttons per Module nested here */}
            {item.name === "Santé" && (
              <RoleGuard permission="consultations.write">
                <Link href="/dashboard/consultations/new" className="block mt-1">
                  <Button variant="ghost" className="w-full justify-start h-9 px-3 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/10">
                    <Plus className="mr-2 h-3 w-3" />
                    Nouvelle consult.
                  </Button>
                </Link>
              </RoleGuard>
            )}
          </div>
        )}
      </div>
    )
  }

  // Single Item
  return (
    <Link key={item.name} href={item.href!} className="block mb-1">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start h-10 px-3 relative transition-all duration-200",
          isActiveLink
            ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        {isActiveLink && <div className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r-full" />}
        {item.icon && <item.icon className={cn("mr-3 h-4 w-4", isActiveLink ? "text-primary" : "text-muted-foreground/70")} />}
        {item.name}
      </Button>
    </Link>
  )
}