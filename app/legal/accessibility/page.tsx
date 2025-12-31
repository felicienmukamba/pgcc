import { LandingHeader } from "@/components/landing/header"
import { LandingFooter } from "@/components/landing/footer"
import { Accessibility, Eye, Volume2, Keyboard, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AccessibilityPage() {
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
                                <Accessibility className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4">Déclaration d'Accessibilité</h1>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Le Ministère de l'Intérieur s'engage à rendre ses services numériques accessibles à tous les citoyens, sans discrimination.
                            </p>
                        </div>

                        <div className="p-8 md:p-12 space-y-12">
                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-foreground border-b pb-2">Conformité et Standards</h2>
                                <div className="text-muted-foreground leading-relaxed">
                                    <p>
                                        Cette plateforme a été développée en suivant les directives internationales pour l'accessibilité du contenu Web (WCAG 2.1), niveau AA.
                                        Notre objectif est de garantir que personne ne soit laissé de côté dans la modernisation de notre administration.
                                    </p>
                                </div>
                            </section>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="p-6 bg-muted/30 rounded-xl border space-y-3">
                                    <Eye className="h-6 w-6 text-primary" />
                                    <h3 className="font-semibold text-foreground">Visibilité</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Contraste élevé, tailles de police ajustables et compatibilité avec les loupes d'écran.
                                    </p>
                                </div>
                                <div className="p-6 bg-muted/30 rounded-xl border space-y-3">
                                    <Keyboard className="h-6 w-6 text-primary" />
                                    <h3 className="font-semibold text-foreground">Navigation</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Site entièrement navigable au clavier, avec des raccourcis intuitifs et un focus visible.
                                    </p>
                                </div>
                                <div className="p-6 bg-muted/30 rounded-xl border space-y-3">
                                    <Volume2 className="h-6 w-6 text-primary" />
                                    <h3 className="font-semibold text-foreground">Lecteurs d'écran</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Structure sémantique optimisée pour une lecture fluide par les technologies d'assistance.
                                    </p>
                                </div>
                            </div>

                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-foreground border-b pb-2">Signaler un problème</h2>
                                <p className="text-muted-foreground">
                                    Si vous rencontrez des difficultés pour accéder à un contenu ou une fonctionnalité, n'hésitez pas à nous contacter.
                                    Nous nous engageons à vous fournir une alternative accessible dans les meilleurs délais.
                                </p>
                                <Link href="/legal/contact">
                                    <Button variant="outline" className="mt-2">Contactez le support accessibilité</Button>
                                </Link>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    )
}
