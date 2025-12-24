import Link from "next/link"
import { Shield, ChevronRight, Fingerprint, FileCheck, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center bg-background overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted))_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
                <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm text-primary font-medium">Système Opérationnel 24/7</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground leading-[1.1] mb-6">
                            Identité{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-500">
                                Numérique
                            </span>{" "}
                            Nationale
                        </h1>

                        <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
                            La plateforme gouvernementale de nouvelle génération pour la gestion
                            de l'identité et des services publics en{" "}
                            <span className="text-foreground font-semibold">République Démocratique du Congo</span>.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <Link href="/dashboard">
                                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14 text-lg font-semibold group">
                                    Accéder au Portail
                                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="#features">
                                <Button size="lg" variant="outline" className="px-8 h-14 text-lg">
                                    Découvrir les Services
                                </Button>
                            </Link>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                            <div>
                                <p className="text-3xl font-black text-foreground">102M+</p>
                                <p className="text-sm text-muted-foreground">Citoyens</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-foreground">26</p>
                                <p className="text-sm text-muted-foreground">Provinces</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-foreground">24/7</p>
                                <p className="text-sm text-muted-foreground">Disponible</p>
                            </div>
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="relative hidden lg:block">
                        <div className="relative">
                            {/* ID Card Visual */}
                            <div className="relative bg-card rounded-3xl p-8 border border-border shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-start gap-6">
                                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                        <Shield className="h-12 w-12 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-primary font-bold tracking-widest mb-1">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</p>
                                        <h3 className="text-2xl font-black text-foreground mb-1">CARTE D'IDENTITÉ</h3>
                                        <p className="text-muted-foreground text-sm">Biométrique Nationale</p>
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Identifiant</p>
                                        <p className="text-foreground font-mono font-bold">CD-123-456-789-X</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Validité</p>
                                        <p className="text-foreground font-mono font-bold">2024-2034</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-4">
                                    <div className="flex-1 h-12 rounded-lg bg-muted/50 border border-border flex items-center justify-center gap-2">
                                        <Fingerprint className="h-5 w-5 text-green-500" />
                                        <span className="text-xs text-muted-foreground">Biométrie Active</span>
                                    </div>
                                    <div className="h-12 w-12 rounded-lg bg-white dark:bg-slate-200 flex items-center justify-center">
                                        <div className="h-10 w-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgweiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0wIDBoN3Y3SDB6TTEzIDBoN3Y3aC03ek0wIDEzaDd2N0gweiIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0yIDJoM3YzSDJ6TTE1IDJoM3YzaC0zek0yIDE1aDN2M0gyeiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik04IDhoNHY0SDh6IiBmaWxsPSIjMDAwIi8+PC9zdmc+')] bg-contain" />
                                    </div>
                                </div>
                            </div>

                            {/* Floating Cards */}
                            <div className="absolute -left-8 top-1/4 bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <FileCheck className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-foreground font-semibold text-sm">Acte Vérifié</p>
                                        <p className="text-muted-foreground text-xs">Authenticité confirmée</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -right-4 bottom-1/4 bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                        <Heart className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-foreground font-semibold text-sm">Dossier Médical</p>
                                        <p className="text-muted-foreground text-xs">Accès sécurisé</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground">
                <span className="text-xs uppercase tracking-widest">Défiler</span>
                <div className="h-12 w-6 rounded-full border-2 border-border flex items-start justify-center p-1">
                    <div className="h-2 w-1 rounded-full bg-muted-foreground animate-bounce" />
                </div>
            </div>
        </section>
    )
}
