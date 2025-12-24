"use client"

import { useEffect, useState, useRef } from "react"
import { Users, FileText, Building2, Activity, Shield, Fingerprint } from "lucide-react"

// Real DRC statistics
const stats = [
    {
        icon: Users,
        value: 102,
        suffix: "M",
        label: "Population RDC",
        description: "Citoyens à servir (2024)"
    },
    {
        icon: Building2,
        value: 26,
        suffix: "",
        label: "Provinces",
        description: "Couverture nationale"
    },
    {
        icon: FileText,
        value: 3.2,
        suffix: "M",
        label: "Naissances/An",
        description: "Actes à enregistrer"
    },
    {
        icon: Activity,
        value: 99.9,
        suffix: "%",
        label: "Disponibilité",
        description: "Service 24h/24"
    },
    {
        icon: Shield,
        value: 256,
        suffix: "-bit",
        label: "Chiffrement AES",
        description: "Sécurité militaire"
    },
    {
        icon: Fingerprint,
        value: 10,
        suffix: "",
        label: "Empreintes",
        description: "Par citoyen"
    }
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
    const [count, setCount] = useState(0)
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.1 }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (!isVisible) return
        const duration = 2000
        const steps = 60
        const increment = value / steps
        let current = 0
        const timer = setInterval(() => {
            current += increment
            if (current >= value) {
                setCount(value)
                clearInterval(timer)
            } else {
                setCount(current)
            }
        }, duration / steps)
        return () => clearInterval(timer)
    }, [isVisible, value])

    const formatNumber = (num: number) => {
        if (Number.isInteger(num)) {
            return num.toLocaleString("fr-FR")
        }
        return num.toFixed(1)
    }

    return (
        <div ref={ref} className="text-4xl md:text-5xl font-black text-foreground">
            {formatNumber(count)}{suffix}
        </div>
    )
}

export function StatsSection() {
    return (
        <section className="py-20 bg-muted/30 relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
                        ÉCHELLE NATIONALE
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                        La RDC en Chiffres
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Une plateforme conçue pour servir l'un des plus grands pays d'Afrique
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className="group relative bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-all hover:shadow-lg"
                        >
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                            <p className="text-foreground font-semibold mt-2">{stat.label}</p>
                            <p className="text-muted-foreground text-sm mt-1">{stat.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
