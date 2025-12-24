"use client"

import { useState, useEffect } from "react"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
    {
        id: 1,
        name: "Dr. Marie Kasongo",
        role: "Médecin Chef, Hôpital Général de Kinshasa",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80",
        quote: "Avant PGCC, je perdais des heures à chercher les dossiers médicaux de mes patients. Maintenant, j'ai tout l'historique en quelques secondes. C'est une révolution pour la médecine en RDC.",
        rating: 5
    },
    {
        id: 2,
        name: "Jean-Pierre Mukendi",
        role: "Officier d'État Civil, Lubumbashi",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
        quote: "Les files d'attente ont disparu. Les citoyens obtiennent leurs actes de naissance le jour même. Le système biométrique élimine totalement la fraude documentaire.",
        rating: 5
    },
    {
        id: 3,
        name: "Commandant Patrick Ilunga",
        role: "Officier de Police Judiciaire, Goma",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
        quote: "L'accès instantané au casier judiciaire national nous permet d'identifier rapidement les récidivistes. La chaîne de hachage garantit l'intégrité de toutes les données.",
        rating: 5
    },
    {
        id: 4,
        name: "Mama Bijou Kalala",
        role: "Citoyenne, Mbuji-Mayi",
        image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80",
        quote: "J'ai pu enregistrer la naissance de mon enfant en 10 minutes avec ma carte d'identité biométrique. Avant, il fallait des semaines et beaucoup de déplacements.",
        rating: 5
    }
]

export function TestimonialsSection() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    useEffect(() => {
        if (!isAutoPlaying) return
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [isAutoPlaying])

    const goToNext = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }

    const goToPrev = () => {
        setIsAutoPlaying(false)
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

    return (
        <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-sm font-semibold rounded-full mb-4">
                        TÉMOIGNAGES
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Ce Qu'ils Disent de PGCC
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Utilisateurs à travers la RDC partagent leur expérience
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Navigation */}
                    <button
                        onClick={goToPrev}
                        className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute -right-4 md:-right-16 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Testimonial Card */}
                    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 md:p-12 relative">
                        <Quote className="absolute top-8 left-8 h-12 w-12 text-blue-500/20" />

                        <div className="text-center">
                            {/* Avatar */}
                            <div className="relative inline-block mb-6">
                                <img
                                    src={testimonials[currentIndex].image}
                                    alt={testimonials[currentIndex].name}
                                    className="h-20 w-20 rounded-full object-cover border-4 border-slate-800"
                                />
                                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>

                            {/* Stars */}
                            <div className="flex justify-center gap-1 mb-6">
                                {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                ))}
                            </div>

                            {/* Quote */}
                            <blockquote className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-8 italic">
                                "{testimonials[currentIndex].quote}"
                            </blockquote>

                            {/* Author */}
                            <div>
                                <p className="text-lg font-bold text-white">{testimonials[currentIndex].name}</p>
                                <p className="text-slate-400">{testimonials[currentIndex].role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-8">
                        {testimonials.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setIsAutoPlaying(false)
                                    setCurrentIndex(idx)
                                }}
                                className={`h-2 rounded-full transition-all ${idx === currentIndex ? "w-8 bg-emerald-500" : "w-2 bg-slate-700 hover:bg-slate-600"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
