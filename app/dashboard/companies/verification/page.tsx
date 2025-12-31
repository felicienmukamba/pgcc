"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, CheckCircle, XCircle, ShieldCheck, Building2, Code, Key } from "lucide-react"

export default function CompaniesVerificationPage() {
    const [searchId, setSearchId] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchId) return

        setLoading(true)
        setResult(null)

        // Simulation d'un appel API
        setTimeout(() => {
            setLoading(false)
            // Simulation: ID pair = valide, ID impair = invalide
            const isValid = searchId.length > 5;

            if (isValid) {
                setResult({
                    status: "valid",
                    data: {
                        firstName: "Jean",
                        lastName: "MUTOMBO",
                        dob: "15/05/1985",
                        validity: "2034",
                        score: 98
                    }
                })
            } else {
                setResult({ status: "invalid" })
            }
        }, 1500)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">API Entreprises</h1>
                <p className="text-muted-foreground">Portail développeur pour la vérification d'identité et les services tiers.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Verification Tool */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-2 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">API v2.1</Badge>
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">En ligne</Badge>
                            </div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                                Vérification d'Identité Citoyenne
                            </CardTitle>
                            <CardDescription>
                                Vérifiez instantanément la validité d'un numéro d'identification nationale (NIN) ou d'un document officiel.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleVerify} className="flex gap-3 mb-8">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Entrez le N° d'Identité Nationale (Ex: CD-123-456)"
                                        className="pl-10 h-11 text-lg font-mono"
                                        value={searchId}
                                        onChange={(e) => setSearchId(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" size="lg" className="h-11 px-8 font-semibold" disabled={loading}>
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                    {loading ? "Vérification..." : "Vérifier"}
                                </Button>
                            </form>

                            {result && (
                                <div className={`rounded-xl border p-6 ${result.status === 'valid' ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                                    {result.status === 'valid' ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-green-700">
                                                <CheckCircle className="h-8 w-8" />
                                                <div>
                                                    <h3 className="font-bold text-lg">Identité Validée</h3>
                                                    <p className="text-sm opacity-90">Le document soumis est authentique et actif.</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-green-200/60">
                                                <div>
                                                    <p className="text-xs text-green-700/70 uppercase font-semibold">Prénom</p>
                                                    <p className="font-bold text-green-900">{result.data.firstName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-green-700/70 uppercase font-semibold">Nom</p>
                                                    <p className="font-bold text-green-900">{result.data.lastName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-green-700/70 uppercase font-semibold">Né(e) le</p>
                                                    <p className="font-bold text-green-900">{result.data.dob}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-green-700/70 uppercase font-semibold">Validité</p>
                                                    <p className="font-bold text-green-900">{result.data.validity}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-red-700">
                                            <XCircle className="h-8 w-8" />
                                            <div>
                                                <h3 className="font-bold text-lg">Identité Invalide</h3>
                                                <p className="text-sm opacity-90">Le numéro fourni n'existe pas ou le document a été suspendu.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code className="h-5 w-5 text-primary" />
                                Documentation Technique
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Exemple d'intégration via cURL pour vos applications bancaires :
                            </p>
                            <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-xs overflow-x-auto shadow-inner">
                                <p><span className="text-purple-400">curl</span> -X POST https://api.gouv.cd/v2/identity/verify \</p>
                                <p className="pl-4">-H <span className="text-green-400">"Authorization: Bearer YOUR_API_KEY"</span> \</p>
                                <p className="pl-4">-H <span className="text-green-400">"Content-Type: application/json"</span> \</p>
                                <p className="pl-4">-d <span className="text-yellow-300">{'{"nid": "CD-123-456"}'}</span></p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Stats & Info */}
                <div className="space-y-6">
                    <Card className="bg-primary text-primary-foreground border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                Vos Clés API
                            </CardTitle>
                            <CardDescription className="text-primary-foreground/80">
                                Gérez vos accès sécurisés aux services de l'État.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-3 bg-primary-foreground/10 rounded-lg backdrop-blur-sm border border-primary-foreground/20 mb-4">
                                <p className="text-xs font-mono opacity-80 mb-1">CLÉ PUBLIQUE (TEST)</p>
                                <p className="font-mono font-bold truncate">pk_test_51Mz...a42x</p>
                            </div>
                            <Button variant="secondary" className="w-full text-primary font-bold">Gérer mes clés</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Quotas d'utilisation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Requêtes ce mois</span>
                                    <span className="font-bold">8,542 / 10,000</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full w-[85%] bg-blue-600 rounded-full" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Taux d'erreur</span>
                                    <span className="font-bold text-green-600">0.01%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Partenaires Agréés
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm space-y-3 text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" /> Banques commerciales
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" /> Opérateurs Télécoms
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" /> Assurances & Mutuelles
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
