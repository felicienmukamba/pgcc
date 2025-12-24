"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateVerhoeff } from "@/lib/identity"
import { ShieldCheck, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        nationalId: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        birthDate: "",
        address: ""
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [nationalIdValid, setNationalIdValid] = useState<boolean | null>(null)

    const handleNationalIdChange = (value: string) => {
        setFormData(prev => ({ ...prev, nationalId: value }))

        if (value.length >= 10) {
            const isValid = validateVerhoeff(value)
            setNationalIdValid(isValid)
            if (!isValid) {
                setErrors(prev => ({ ...prev, nationalId: "Checksum invalide" }))
            } else {
                setErrors(prev => {
                    const { nationalId, ...rest } = prev
                    return rest
                })
            }
        } else {
            setNationalIdValid(null)
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.nationalId || !validateVerhoeff(formData.nationalId)) {
            newErrors.nationalId = "ID National valide requis"
        }
        if (!formData.password || formData.password.length < 8) {
            newErrors.password = "Minimum 8 caractères"
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
        }
        if (!formData.firstName) newErrors.firstName = "Prénom requis"
        if (!formData.lastName) newErrors.lastName = "Nom requis"
        if (!formData.email) newErrors.email = "Email requis"
        if (!formData.birthDate) newErrors.birthDate = "Date de naissance requise"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/register-citizen", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                router.push("/auth/login-citizen?registered=true")
            } else {
                const errorText = await response.text()
                setErrors({ general: errorText || "Erreur d'enregistrement" })
            }
        } catch (error) {
            setErrors({ general: "Erreur réseau. Veuillez réessayer." })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

            {/* Flag Colors */}
            <div className="absolute top-0 left-0 w-full h-1 flex">
                <div className="flex-1 bg-blue-500" />
                <div className="flex-1 bg-yellow-400" />
                <div className="flex-1 bg-red-500" />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
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
                                <CardTitle className="text-2xl font-bold">Enrôlement Citoyen</CardTitle>
                                <CardDescription className="text-blue-100">
                                    Système National d'Identité Numérique
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {errors.general && (
                                <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{errors.general}</AlertDescription>
                                </Alert>
                            )}

                            {/* National ID */}
                            <div className="space-y-2">
                                <Label htmlFor="nationalId" className="text-slate-200 font-medium">
                                    Numéro d'Identité Nationale *
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="nationalId"
                                        value={formData.nationalId}
                                        onChange={(e) => handleNationalIdChange(e.target.value)}
                                        placeholder="Entrez votre ID National"
                                        className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12 ${nationalIdValid === false ? "border-red-500 focus-visible:ring-red-500" :
                                                nationalIdValid === true ? "border-emerald-500 focus-visible:ring-emerald-500" : ""
                                            }`}
                                    />
                                    {nationalIdValid === true && (
                                        <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-emerald-400" />
                                    )}
                                </div>
                                {errors.nationalId && <p className="text-sm text-red-400">{errors.nationalId}</p>}
                                <p className="text-xs text-slate-500">Doit passer la validation Verhoeff</p>
                            </div>

                            {/* Names */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-slate-200">Prénom *</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11"
                                    />
                                    {errors.firstName && <p className="text-sm text-red-400">{errors.firstName}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-slate-200">Nom *</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11"
                                    />
                                    {errors.lastName && <p className="text-sm text-red-400">{errors.lastName}</p>}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-200">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11"
                                />
                                {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
                            </div>

                            {/* Phone & Birth */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber" className="text-slate-200">Téléphone</Label>
                                    <Input
                                        id="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                        placeholder="+243..."
                                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="birthDate" className="text-slate-200">Date de Naissance *</Label>
                                    <Input
                                        id="birthDate"
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                                        className="bg-slate-800/50 border-slate-700 text-white h-11"
                                    />
                                    {errors.birthDate && <p className="text-sm text-red-400">{errors.birthDate}</p>}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-slate-200">Adresse</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    placeholder="Province, Ville, Commune..."
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-11"
                                />
                            </div>

                            {/* Passwords */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-200">Mot de Passe *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        className="bg-slate-800/50 border-slate-700 text-white h-11"
                                    />
                                    {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-slate-200">Confirmer *</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="bg-slate-800/50 border-slate-700 text-white h-11"
                                    />
                                    {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword}</p>}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
                                disabled={isLoading || nationalIdValid === false}
                            >
                                {isLoading ? "Enregistrement en cours..." : "Créer mon Identité Numérique"}
                            </Button>

                            <p className="text-center text-slate-400 text-sm">
                                Déjà enregistré ?{" "}
                                <Link href="/auth/login-citizen" className="text-blue-400 hover:text-blue-300 font-medium">
                                    Se connecter
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
