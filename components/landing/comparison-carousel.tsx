"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Clock, FileStack, Users, AlertTriangle } from "lucide-react"

const comparisons = [
    {
        id: 1,
        title: "Enregistrement des Citoyens",
        before: {
            image: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80",
            description: "Files d'attente interminables dans les bureaux de l'état civil",
            pain: "3 à 7 jours d'attente",
            icon: Clock
        },
        after: {
            image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
            description: "Enrôlement biométrique numérique instantané",
            benefit: "Moins de 15 minutes",
            icon: Users
        }
    },
    {
        id: 2,
        title: "Dossiers Médicaux",
        before: {
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
            description: "Recherche manuelle dans des archives papier",
            pain: "Historique médical souvent perdu",
            icon: FileStack
        },
        after: {
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
            description: "Accès instantané au carnet de santé numérique",
            benefit: "100% disponible, 0% de perte",
            icon: Users
        }
    },
    {
        id: 3,
        title: "Actes d'État Civil",
        before: {
            image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
            description: "Registres manuscrits difficiles à déchiffrer",
            pain: "Risque d'erreurs et de fraude",
            icon: AlertTriangle
        },
        after: {
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
            description: "Certificats numériques avec QR code de vérification",
            benefit: "Authentification instantanée",
            icon: Users
        }
    },
    {
        id: 4,
        title: "Casier Judiciaire",
        before: {
            image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
            description: "Archives judiciaires dispersées entre tribunaux",
            pain: "Semaines pour obtenir un extrait",
            icon: Clock
        },
        after: {
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
            description: "Base de données nationale centralisée et sécurisée",
            benefit: "Extrait généré en quelques clics",
            icon: Users
        }
    }
]

export function ComparisonCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    useEffect(() => {
        if (!isAutoPlaying) return
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % comparisons.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [isAutoPlaying])

    const goToNext = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev + 1) % comparisons.length)
    }

    const goToPrev = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev - 1 + comparisons.length) % comparisons.length)
    }

    const current = comparisons[currentIndex]

    return (
        <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-400 text-sm font-semibold rounded-full mb-4">
                        AVANT / APRÈS
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                        La Transformation Digitale
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Découvrez comment PGCC modernise les services publics de la RDC
                    </p>
                </div>

                {/* Carousel */}
                <div className="relative max-w-6xl mx-auto">
                    {/* Navigation Buttons */}
                    <button
                        onClick={goToPrev}
                        className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
                        {current.title}
                    </h3>

                    {/* Comparison Cards */}
                    <div className="grid md:grid-cols-2 gap-6 md:gap-12">
                        {/* BEFORE */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity" />
                            <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={current.before.image}
                                        alt="Avant"
                                        className="w-full h-full object-cover filter grayscale brightness-75"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/90 text-white text-sm font-bold rounded-full">
                                            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                            AVANT
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-slate-300 text-lg mb-4">{current.before.description}</p>
                                    <div className="flex items-center gap-3 text-red-400">
                                        <current.before.icon className="h-5 w-5" />
                                        <span className="font-semibold">{current.before.pain}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AFTER */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity" />
                            <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={current.after.image}
                                        alt="Après"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/90 text-white text-sm font-bold rounded-full">
                                            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                            APRÈS
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-slate-300 text-lg mb-4">{current.after.description}</p>
                                    <div className="flex items-center gap-3 text-emerald-400">
                                        <current.after.icon className="h-5 w-5" />
                                        <span className="font-semibold">{current.after.benefit}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dots Navigation */}
                    <div className="flex justify-center gap-2 mt-8">
                        {comparisons.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setIsAutoPlaying(false)
                                    setCurrentIndex(idx)
                                }}
                                className={`h-2 rounded-full transition-all ${idx === currentIndex ? "w-8 bg-blue-500" : "w-2 bg-slate-700 hover:bg-slate-600"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
