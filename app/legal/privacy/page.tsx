import { LandingHeader } from "@/components/landing/header"
import { LandingFooter } from "@/components/landing/footer"
import { Shield, Lock, Eye, FileText, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
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
                                <Shield className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4">Politique de Confidentialité</h1>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                La protection de vos données personnelles est au cœur de notre mission de service public.
                                Cette politique détaille comment le Ministère de l'Intérieur traite vos informations.
                            </p>
                        </div>

                        <div className="p-8 md:p-12 space-y-12">
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <FileText className="h-6 w-6" />
                                    <h2 className="text-xl font-bold text-foreground">1. Collecte des Données</h2>
                                </div>
                                <div className="pl-9 prose dark:prose-invert text-muted-foreground">
                                    <p>
                                        Nous collectons uniquement les données strictement nécessaires à l'exercice de nos missions de service public :
                                    </p>
                                    <ul className="list-disc leading-relaxed mt-2 space-y-2">
                                        <li>Informations d'état civil (nom, prénoms, date de naissance)</li>
                                        <li>Données biométriques pour l'identification sécurisée</li>
                                        <li>Coordonnées de contact (adresse, email, téléphone)</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Eye className="h-6 w-6" />
                                    <h2 className="text-xl font-bold text-foreground">2. Utilisation des Données</h2>
                                </div>
                                <div className="pl-9 text-muted-foreground leading-relaxed">
                                    <p>
                                        Vos données sont utilisées exclusivement pour :
                                    </p>
                                    <ul className="list-disc mt-2 space-y-2">
                                        <li>La délivrance de documents officiels (Identité, Passeport)</li>
                                        <li>La gestion des services civils (Naissances, Mariages, Décès)</li>
                                        <li>L'authentification sécurisée aux services gouvernementaux</li>
                                    </ul>
                                    <p className="mt-4 p-4 bg-muted/50 rounded-lg border text-sm">
                                        <strong>Note importante :</strong> Vos données ne sont jamais vendues ni partagées à des acteurs commerciaux.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Lock className="h-6 w-6" />
                                    <h2 className="text-xl font-bold text-foreground">3. Sécurité et Hébergement</h2>
                                </div>
                                <div className="pl-9 text-muted-foreground leading-relaxed">
                                    <p>
                                        Toutes les données sont hébergées souverainement sur le territoire de la République Démocratique du Congo,
                                        dans des centres de données gouvernementaux ultra-sécurisés.
                                    </p>
                                    <p className="mt-2">
                                        Nous utilisons des protocoles de chiffrement de pointe (AES-256) pour garantir la confidentialité de vos échanges.
                                    </p>
                                </div>
                            </section>

                            <div className="pt-8 border-t text-center text-sm text-muted-foreground">
                                Dernière mise à jour le {new Date().toLocaleDateString("fr-FR")} • Direction des Services Informatiques
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    )
}
