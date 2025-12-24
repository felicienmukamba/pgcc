import {
    Fingerprint,
    Database,
    Lock,
    Smartphone,
    Globe,
    FileText
} from "lucide-react"

const features = [
    {
        icon: Fingerprint,
        title: "Identité Biométrique",
        description: "Enregistrement unique et infalsifiable basé sur les empreintes digitales et la reconnaissance faciale."
    },
    {
        icon: Database,
        title: "Centralisation des Données",
        description: "Une base de données nationale unifiée connectant tous les services de l'état civil en temps réel."
    },
    {
        icon: Lock,
        title: "Sécurité Maximale",
        description: "Chiffrement de bout en bout et protocoles de sécurité avancés pour protéger la vie privée des citoyens."
    },
    {
        icon: FileText,
        title: "Documents Numériques",
        description: "Génération instantanée d'actes de naissance, mariage et certificats de nationalité signés électroniquement."
    },
    {
        icon: Globe,
        title: "Accès Universel",
        description: "Disponible dans toutes les provinces et ambassades pour servir les citoyens où qu'ils soient."
    },
    {
        icon: Smartphone,
        title: "Services Mobiles",
        description: "Applications dédiées pour les agents de terrain permettant l'enrôlement dans les zones reculées."
    }
]

export function FeaturesSection() {
    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Une Infrastructure Technologique de Pointe
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Conçu pour répondre aux défis modernes de l'identification et de la gouvernance numérique.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="h-12 w-12 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
