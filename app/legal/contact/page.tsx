import { LandingHeader } from "@/components/landing/header"
import { LandingFooter } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-950">
            <LandingHeader />

            <main className="flex-1 py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-8 max-w-6xl mx-auto">
                        <Link href="/">
                            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-primary pl-0">
                                <ChevronLeft className="h-4 w-4" />
                                Retour à l'accueil
                            </Button>
                        </Link>
                    </div>

                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Info Column */}
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-4xl font-black text-foreground mb-4">Contactez-nous</h1>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Notre équipe est disponible pour répondre à vos questions concernant les services administratifs et l'utilisation de la plateforme.
                                </p>
                            </div>

                            <div className="grid gap-6">
                                <div className="p-6 bg-background rounded-2xl border shadow-sm flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-[#007bff] rounded-lg">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground mb-1">Siège Central</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            Ministère de l'Intérieur<br />
                                            Av. du Colonel Ebeya, Kinshasa/Gombe<br />
                                            République Démocratique du Congo
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 bg-background rounded-2xl border shadow-sm flex items-start gap-4">
                                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground mb-1">Assistance Téléphonique</h3>
                                        <p className="text-muted-foreground text-sm mb-2">Du Lundi au Vendredi, de 8h à 17h</p>
                                        <p className="text-lg font-mono font-bold text-foreground">+243 995 291 33</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-background rounded-2xl border shadow-sm flex items-start gap-4">
                                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground mb-1">Email</h3>
                                        <p className="text-muted-foreground text-sm mb-2">Pour les requêtes non-urgentes</p>
                                        <p className="font-medium text-foreground">felicienmukamba.cd@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Column */}
                        <div className="bg-background rounded-3xl shadow-lg border p-8 md:p-10 relative overflow-hidden">
                            {/* Decorative gradient background opacity */}
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />

                            <div className="flex items-center gap-2 mb-8">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                <h2 className="text-2xl font-bold">Envoyer un message</h2>
                            </div>

                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstname">Prénom</Label>
                                        <Input id="firstname" placeholder="Ex: Jean" className="bg-slate-50/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastname">Nom</Label>
                                        <Input id="lastname" placeholder="Ex: Mutombo" className="bg-slate-50/50" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Adresse Email</Label>
                                    <Input id="email" type="email" placeholder="jean.mutombo@email.com" className="bg-slate-50/50" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject">Sujet</Label>
                                    <Input id="subject" placeholder="Ex: Problème d'accès au compte" className="bg-slate-50/50" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" placeholder="Votre message détaillé..." className="min-h-[150px] bg-slate-50/50 resize-y" />
                                </div>

                                <Button className="w-full h-12 text-lg font-semibold bg-[#007bff] hover:bg-[#0056b3] shadow-md transition-all">
                                    <Send className="mr-2 h-4 w-4" />
                                    Envoyer le message
                                </Button>

                                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5 pt-2">
                                    <Clock className="h-3 w-3" />
                                    Temps de réponse moyen : 24 à 48 heures ouvrables
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    )
}
