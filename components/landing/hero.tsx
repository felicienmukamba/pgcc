import Link from "next/link"
import { Shield, ChevronRight, Fingerprint, FileCheck, Heart, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center bg-slate-950 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
                <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Flag Colors Accent */}
            <div className="absolute top-0 left-0 w-full h-1 flex">
                <div className="flex-1 bg-blue-500" />
                <div className="flex-1 bg-yellow-400" />
                <div className="flex-1 bg-red-500" />
            </div>

            <div className="container mx-auto px-4 relative z-10 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-sm text-blue-400 font-medium">Système Opérationnel 24/7</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6">
                            Identité{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                                Numérique
                            </span>{" "}
                            Nationale
                        </h1>

                        <p className="text-xl text-slate-400 leading-relaxed mb-8 max-w-xl">
                            La plateforme gouvernementale de nouvelle génération pour la gestion
                            de l'identité et des services publics en{" "}
                            <span className="text-white font-semibold">République Démocratique du Congo</span>.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <Link href="/dashboard">
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-14 text-lg font-semibold group">
                                    Accéder au Portail
                                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="#features">
                                <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 px-8 h-14 text-lg">
                                    Découvrir les Services
                                </Button>
                            </Link>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800">
                            <div>
                                <p className="text-3xl font-black text-white">95M+</p>
                                <p className="text-sm text-slate-500">Citoyens</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-white">26</p>
                                <p className="text-sm text-slate-500">Provinces</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-white">24/7</p>
                                <p className="text-sm text-slate-500">Disponible</p>
                            </div>
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="relative hidden lg:block">
                        <div className="relative">
                            {/* ID Card Visual */}
                            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 shadow-2xl shadow-blue-900/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-start gap-6">
                                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                        <Shield className="h-12 w-12 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-blue-400 font-bold tracking-widest mb-1">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</p>
                                        <h3 className="text-2xl font-black text-white mb-1">CARTE D'IDENTITÉ</h3>
                                        <p className="text-slate-500 text-sm">Biométrique Nationale</p>
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">Identifiant</p>
                                        <p className="text-white font-mono font-bold">CD-123-456-789-X</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">Validité</p>
                                        <p className="text-white font-mono font-bold">2024-2034</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-4">
                                    <div className="flex-1 h-12 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-center gap-2">
                                        <Fingerprint className="h-5 w-5 text-emerald-400" />
                                        <span className="text-xs text-slate-400">Biométrie Active</span>
                                    </div>
                                    <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center">
                                        <div className="h-10 w-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgweiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0wIDBoN3Y3SDB6TTEzIDBoN3Y3aC03ek0wIDEzaDd2N0gweiIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0yIDJoM3YzSDJ6TTE1IDJoM3YzaC0zek0yIDE1aDN2M0gyeiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik04IDhoNHY0SDh6IiBmaWxsPSIjMDAwIi8+PC9zdmc+')] bg-contain" />
                                    </div>
                                </div>
                            </div>

                            {/* Floating Cards */}
                            <div className="absolute -left-8 top-1/4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                        <FileCheck className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">Acte Vérifié</p>
                                        <p className="text-slate-500 text-xs">Authenticité confirmée</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -right-4 bottom-1/4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <Heart className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">Dossier Médical</p>
                                        <p className="text-slate-500 text-xs">Accès sécurisé</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500">
                <span className="text-xs uppercase tracking-widest">Défiler</span>
                <div className="h-12 w-6 rounded-full border-2 border-slate-700 flex items-start justify-center p-1">
                    <div className="h-2 w-1 rounded-full bg-slate-500 animate-bounce" />
                </div>
            </div>
        </section>
    )
}
