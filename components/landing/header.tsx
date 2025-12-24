"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Shield, Menu, X, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function LandingHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [username, setUsername] = useState<string | null>(null)

    // Use useSession only on client side after mount
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

    return (
        <header className="fixed top-0 w-full z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50">
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
                        <span className="text-lg font-black text-white block leading-none">PGCC</span>
                        <span className="text-[10px] text-blue-400/80 font-semibold uppercase tracking-widest">
                            RDC • GOV
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Services
                    </a>
                    <a href="#comparison" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Transformation
                    </a>
                    <a href="#testimonials" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Témoignages
                    </a>
                    <a href="#roadmap" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Fonctionnalités
                    </a>
                </nav>

                {/* Auth Buttons */}
                <div className="flex items-center gap-3">
                    {isLoading ? (
                        <div className="h-9 w-24 bg-slate-800 rounded-md animate-pulse" />
                    ) : isAuthenticated ? (
                        <>
                            <span className="hidden sm:block text-sm text-slate-400">
                                Bonjour, <span className="text-white font-medium">{username}</span>
                            </span>
                            <Link href="/dashboard">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2">
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span className="hidden sm:inline">Tableau de Bord</span>
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login-citizen" className="hidden sm:block">
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800">
                                    Connexion
                                </Button>
                            </Link>
                            <Link href="/auth/register-citizen">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                                    S'inscrire
                                </Button>
                            </Link>
                        </>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden h-10 w-10 flex items-center justify-center text-slate-400 hover:text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-slate-900 border-t border-slate-800">
                    <nav className="container mx-auto px-4 py-4 space-y-2">
                        <a href="#features" className="block py-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                            Services
                        </a>
                        <a href="#comparison" className="block py-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                            Transformation
                        </a>
                        <a href="#testimonials" className="block py-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                            Témoignages
                        </a>
                        <a href="#roadmap" className="block py-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                            Fonctionnalités
                        </a>
                        {!isAuthenticated && (
                            <Link href="/auth/login-citizen" className="block py-2 text-blue-400 font-medium" onClick={() => setMobileMenuOpen(false)}>
                                Se Connecter
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    )
}
