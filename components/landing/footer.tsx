import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export function LandingFooter() {
    return (
        <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2 text-white font-bold text-xl">
                            <ShieldCheck className="h-6 w-6 text-blue-500" />
                            <span>Gov-Citizen</span>
                        </div>
                        <p className="max-w-xs text-sm">
                            Plateforme officielle de gestion de l'identité nationale et des services d'état civil de la République Démocratique du Congo.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Services</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-blue-400">Enrôlement Citoyen</Link></li>
                            <li><Link href="#" className="hover:text-blue-400">Actes de Naissance</Link></li>
                            <li><Link href="#" className="hover:text-blue-400">Passeports</Link></li>
                            <li><Link href="#" className="hover:text-blue-400">Permis de Conduire</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Légal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-blue-400">Confidentialité</Link></li>
                            <li><Link href="#" className="hover:text-blue-400">Conditions d'utilisation</Link></li>
                            <li><Link href="#" className="hover:text-blue-400">Accessibilité</Link></li>
                            <li><Link href="#" className="hover:text-blue-400">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                    <p>© {new Date().getFullYear()} Ministère de l'Intérieur. Tous droits réservés.</p>
                    <div className="flex items-center gap-4">
                        <span>Version 2.0.0</span>
                        <span>Secured by ANR</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
