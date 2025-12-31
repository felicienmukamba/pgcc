import { LandingHeader } from "@/components/landing/header"
import { LandingFooter } from "@/components/landing/footer"
import { ScrollText, ShieldCheck, AlertCircle, ChevronLeft, Gavel } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-950">
            <LandingHeader />

            <main className="flex-1 py-12 md:py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="mb-8">
                        <Link href="/">
                            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-primary pl-0">
                                <ChevronLeft className="h-4 w-4" />
                                Retour à l'accueil
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
                        <div className="bg-primary/5 p-8 md:p-12 border-b border-border text-center">
                            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-6">
                                <ScrollText className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4">Conditions d'Utilisation</h1>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Règles et engagements régissant l'utilisation de la plateforme PGCC.
                            </p>
                        </div>

                        <div className="p-8 md:p-12 space-y-12">
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <ShieldCheck className="h-6 w-6" />
                                    <h2 className="text-xl font-bold text-foreground">1. Acceptation des Conditions</h2>
                                </div>
                                <div className="pl-9 text-muted-foreground leading-relaxed">
                                    <p>
                                        L'accès et l'utilisation de la Plateforme Gouvernementale de Gestion des Citoyens (PGCC) impliquent l'acceptation
                                        sans réserve des présentes conditions générales d'utilisation.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <AlertCircle className="h-6 w-6" />
                                    <h2 className="text-xl font-bold text-foreground">2. Engagements de l'Utilisateur</h2>
                                </div>
                                <div className="pl-9 text-muted-foreground leading-relaxed space-y-4">
                                    <p>En utilisant ce service, vous vous engagez à :</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>Fournir des informations exactes, sincères et à jour.</li>
                                        <li>Ne pas usurper l'identité d'un tiers.</li>
                                        <li>Ne pas tenter de contourner les mesures de sécurité de la plateforme.</li>
                                    </ul>
                                    <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg text-sm text-red-800 dark:text-red-200">
                                        <span className="font-bold block mb-1">Attention :</span>
                                        Toute fausse déclaration ou usage de faux documents est passible de poursuites pénales conformément au Code Pénal Congolais.
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Gavel className="h-6 w-6" />
                                    <h2 className="text-xl font-bold text-foreground">3. Responsabilité de l'Administration</h2>
                                </div>
                                <div className="pl-9 text-muted-foreground leading-relaxed">
                                    <p>
                                        Le Ministère de l'Intérieur met tout en œuvre pour assurer la disponibilité et la sécurité du service.
                                        Toutefois, une maintenance technique peut occasionner des interruptions temporaires.
                                    </p>
                                </div>
                            </section>

                            <div className="pt-8 border-t text-center text-sm text-muted-foreground">
                                Entrée en vigueur le 01 Janvier 2025 • Ministère de l'Intérieur
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    )
}
