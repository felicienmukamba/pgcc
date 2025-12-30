"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldCheck, AlertCircle, KeyRound, ArrowLeft } from "lucide-react"

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        nationalId: "",
        password: "",
        mfaToken: ""
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [requireMfa, setRequireMfa] = useState(false)
    const [tempIdentityId, setTempIdentityId] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setErrors({})

        try {
            const response = await fetch("/api/auth/login-citizen", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nationalId: formData.nationalId,
                    password: formData.password
                })
            })

            if (response.ok) {
                const data = await response.json()

                if (data.requireMfa) {
                    setRequireMfa(true)
                    setTempIdentityId(data.identityId)
                } else {
                    router.push("/dashboard")
                }
            } else {
                const errorText = await response.text()
                setErrors({ general: errorText || "Identifiants invalides" })
            }
        } catch (error) {
            setErrors({ general: "Erreur réseau. Veuillez réessayer." })
        } finally {
            setIsLoading(false)
        }
    }

    const handleMfaVerification = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setErrors({})

        try {
            const response = await fetch("/api/auth/mfa/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identityId: tempIdentityId,
                    token: formData.mfaToken
                })
            })

            if (response.ok) {
                router.push("/dashboard")
            } else {
                const errorText = await response.text()
                setErrors({ mfa: errorText || "Code MFA invalide" })
            }
        } catch (error) {
            setErrors({ mfa: "Erreur réseau. Veuillez réessayer." })
        } finally {
            setIsLoading(false)
        }
    }

    if (requireMfa) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
                <div className="absolute top-0 left-0 w-full h-1 flex">
                    <div className="flex-1 bg-blue-500" />
                    <div className="flex-1 bg-yellow-400" />
                    <div className="flex-1 bg-red-500" />
                </div>

                <Card className="w-full max-w-md border-slate-800 bg-slate-900/80 backdrop-blur-sm shadow-2xl relative z-10">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                <KeyRound className="h-8 w-8" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">Vérification MFA</CardTitle>
                                <CardDescription className="text-blue-100">
                                    Entrez le code de votre application
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleMfaVerification} className="space-y-4">
                            {errors.mfa && (
                                <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{errors.mfa}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="mfaToken" className="text-slate-200">Code à 6 Chiffres</Label>
                                <Input
                                    id="mfaToken"
                                    value={formData.mfaToken}
                                    onChange={(e) => setFormData(prev => ({ ...prev, mfaToken: e.target.value }))}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="bg-slate-800/50 border-slate-700 text-white text-center text-3xl tracking-[0.5em] h-16 font-mono"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                                disabled={isLoading || formData.mfaToken.length !== 6}
                            >
                                {isLoading ? "Vérification..." : "Vérifier & Connexion"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
            <div className="absolute top-0 left-0 w-full h-1 flex">
                <div className="flex-1 bg-blue-500" />
                <div className="flex-1 bg-yellow-400" />
                <div className="flex-1 bg-red-500" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Retour à l'accueil
                </Link>

                <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-sm shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">Connexion Sécurisée</CardTitle>
                                <CardDescription className="text-blue-100">
                                    Système National d'Identité
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleLogin} className="space-y-4">
                            {errors.general && (
                                <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{errors.general}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="nationalId" className="text-slate-200">ID National</Label>
                                <Input
                                    id="nationalId"
                                    value={formData.nationalId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                                    placeholder="Entrez votre ID National"
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-200">Mot de Passe</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    className="bg-slate-800/50 border-slate-700 text-white h-12"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                disabled={isLoading}
                            >
                                {isLoading ? "Authentification..." : "Se Connecter"}
                            </Button>

                            <p className="text-center text-slate-400 text-sm">
                                Pas encore enregistré ?{" "}
                                <Link href="/auth/register-citizen" className="text-blue-400 hover:text-blue-300 font-medium">
                                    Créer un compte
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
