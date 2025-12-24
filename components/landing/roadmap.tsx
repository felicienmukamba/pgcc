"use client"

import {
    Fingerprint,
    Heart,
    Scale,
    FileText,
    Shield,
    Lock,
    KeyRound,
    CheckCircle2,
    Clock,
    Globe,
    Brain,
    Smartphone
} from "lucide-react"

// Features that are ALREADY IMPLEMENTED
const implementedFeatures = [
    {
        icon: Fingerprint,
        title: "Enrôlement Biométrique",
        description: "Capture photo, empreintes digitales et génération de carte d'identité avec QR code",
        status: "completed"
    },
    {
        icon: FileText,
        title: "État Civil Complet",
        description: "Gestion des actes de naissance, mariage, divorce et décès avec génération PDF",
        status: "completed"
    },
    {
        icon: Heart,
        title: "Dossier Médical Unifié",
        description: "Consultations, prescriptions et examens médicaux liés à l'identité nationale",
        status: "completed"
    },
    {
        icon: Scale,
        title: "Casier Judiciaire",
        description: "Gestion des plaintes et condamnations par les officiers de police judiciaire",
        status: "completed"
    },
    {
        icon: Lock,
        title: "Chiffrement AES-256-GCM",
        description: "Toutes les données personnelles sont chiffrées avec un algorithme de grade militaire",
        status: "completed"
    },
    {
        icon: KeyRound,
        title: "Authentification MFA",
        description: "Double facteur avec TOTP compatible Google Authenticator et Authy",
        status: "completed"
    },
    {
        icon: Shield,
        title: "Audit Immutable",
        description: "Chaîne de hachage SHA-256 style blockchain pour la traçabilité totale",
        status: "completed"
    },
    {
        icon: CheckCircle2,
        title: "Validation Verhoeff",
        description: "Algorithme de checksum pour valider l'authenticité des IDs nationaux",
        status: "completed"
    }
]

// Features COMING SOON
const upcomingFeatures = [
    {
        icon: Smartphone,
        title: "Application Mobile",
        description: "Carte d'identité sur smartphone avec validation biométrique",
        status: "upcoming"
    },
    {
        icon: Globe,
        title: "Portail Diaspora",
        description: "Services consulaires numériques pour les Congolais à l'étranger",
        status: "upcoming"
    },
    {
        icon: Brain,
        title: "IA Anti-Fraude",
        description: "Détection automatique des tentatives de fraude documentaire",
        status: "upcoming"
    },
    {
        icon: Clock,
        title: "API Entreprises",
        description: "Vérification d'identité pour banques, employeurs et services tiers",
        status: "upcoming"
    }
]

export function RoadmapSection() {
    return (
        <section className="py-24 bg-muted/30 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-semibold rounded-full mb-4">
                        FONCTIONNALITÉS
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                        Ce Qui Est Déjà Opérationnel
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        L'infrastructure numérique du Congo est en marche
                    </p>
                </div>

                {/* Implemented Features */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {implementedFeatures.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group p-6 bg-card border border-green-500/20 rounded-2xl hover:border-green-500/40 transition-all relative overflow-hidden shadow-sm hover:shadow-md"
                        >
                            <div className="absolute top-3 right-3">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Actif
                                </span>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <feature.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-16">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
                    <span className="text-muted-foreground font-semibold uppercase tracking-widest text-sm">Prochainement</span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
                </div>

                {/* Upcoming Features */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {upcomingFeatures.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group p-6 bg-card/50 border border-border rounded-2xl hover:border-primary/30 transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-3 right-3">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
                                    <Clock className="h-3 w-3" />
                                    Bientôt
                                </span>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform opacity-60 group-hover:opacity-100">
                                <feature.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground/80 mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
