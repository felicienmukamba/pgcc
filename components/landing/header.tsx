"use client"

import Link from "next/link"
import { Shield, Menu, X, LayoutDashboard, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

export function LandingHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [username, setUsername] = useState<string | null>(null)
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch("/api/auth/session")
                const session = await res.json()
                if (session?.user) {
                    setIsAuthenticated(true)
                    setUsername(session.user.username || session.user.name || "Utilisateur")
                }
            } catch (e) {
                // No session
            } finally {
                setIsLoading(false)
            }
        }
        checkSession()
    }, [])

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    return (
        <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-xl border-b border-border">
            {/* Flag Colors */}
            <div className="absolute top-0 left-0 w-full h-0.5 flex">
                <div className="flex-1 bg-blue-500" />
                <div className="flex-1 bg-yellow-400" />
                <div className="flex-1 bg-red-500" />
            </div>

            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/30">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div className="hidden sm:block">
                        <span className="text-lg font-black text-foreground block leading-none">PGCC</span>
                        <span className="text-[10px] text-primary/80 font-semibold uppercase tracking-widest">
                            RDC • GOV
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Services
                    </a>
                    <a href="#comparison" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Transformation
                    </a>
                    <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Témoignages
                    </a>
                    <a href="#roadmap" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Fonctionnalités
                    </a>
                </nav>

                {/* Auth Buttons & Theme Toggle */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    {mounted && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            {resolvedTheme === "dark" ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </Button>
                    )}

                    {isLoading ? (
                        <div className="h-9 w-24 bg-muted rounded-md animate-pulse" />
                    ) : isAuthenticated ? (
                        <>
                            <span className="hidden sm:block text-sm text-muted-foreground">
                                Bonjour, <span className="text-foreground font-medium">{username}</span>
                            </span>
                            <Link href="/dashboard">
                                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span className="hidden sm:inline">Tableau de Bord</span>
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login-citizen" className="hidden sm:block">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    Connexion
                                </Button>
                            </Link>
                            <Link href="/auth/register-citizen">
                                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                                    S'inscrire
                                </Button>
                            </Link>
                        </>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-card border-t border-border">
                    <nav className="container mx-auto px-4 py-4 space-y-2">
                        <a href="#features" className="block py-2 text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                            Services
                        </a>
                        <a href="#comparison" className="block py-2 text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                            Transformation
                        </a>
                        <a href="#testimonials" className="block py-2 text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                            Témoignages
                        </a>
                        <a href="#roadmap" className="block py-2 text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                            Fonctionnalités
                        </a>
                        {!isAuthenticated && (
                            <Link href="/auth/login-citizen" className="block py-2 text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
                                Se Connecter
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    )
}
