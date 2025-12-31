import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export function LandingFooter() {
    return (
        <footer className="bg-card border-t border-border text-muted-foreground py-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2 text-foreground font-bold text-xl">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            <span>PGCC</span>
                        </div>
                        <p className="max-w-xs text-sm">
                            Plateforme Gouvernementale de Gestion des Citoyens Congolais - Système National d'Identité Numérique.
                        </p>
                        <div className="flex gap-1">
                            <div className="h-1 w-8 rounded-full bg-blue-500" />
                            <div className="h-1 w-4 rounded-full bg-yellow-400" />
                            <div className="h-1 w-2 rounded-full bg-red-400" />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Services</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/dashboard/citizens" className="hover:text-primary transition-colors">Annuaire Citoyen</Link></li>
                            <li><Link href="/dashboard/birth-records" className="hover:text-primary transition-colors">Actes de Naissance</Link></li>
                            <li><Link href="/dashboard/marriage-records" className="hover:text-primary transition-colors">Actes de Mariage</Link></li>
                            <li><Link href="/dashboard/consultations" className="hover:text-primary transition-colors">Dossier Médical</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Légal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/legal/privacy" className="hover:text-primary transition-colors">Confidentialité</Link></li>
                            <li><Link href="/legal/terms" className="hover:text-primary transition-colors">Conditions d'utilisation</Link></li>
                            <li><Link href="/legal/accessibility" className="hover:text-primary transition-colors">Accessibilité</Link></li>
                            <li><Link href="/legal/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                    <p>© {new Date().getFullYear()} Ministère de l'Intérieur - RDC. Tous droits réservés.</p>
                    <div className="flex items-center gap-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">v2.0.0</span>
                        <span>Sécurisé par Felicien Mukamba</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
