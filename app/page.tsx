import { HeroSection } from "@/components/landing/hero"
import { FeaturesSection } from "@/components/landing/features"
import { ComparisonCarousel } from "@/components/landing/comparison-carousel"
import { StatsSection } from "@/components/landing/stats"
import { TestimonialsSection } from "@/components/landing/testimonials"
import { RoadmapSection } from "@/components/landing/roadmap"
import { LandingHeader } from "@/components/landing/header"
import { LandingFooter } from "@/components/landing/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <LandingHeader />

      <main className="flex-1 pt-16">
        <HeroSection />

        <div id="features">
          <FeaturesSection />
        </div>

        <div id="comparison">
          <ComparisonCarousel />
        </div>

        <StatsSection />

        <div id="testimonials">
          <TestimonialsSection />
        </div>

        <div id="roadmap">
          <RoadmapSection />
        </div>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-primary to-primary/80 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-primary-foreground mb-6">
              Prêt à Moderniser vos Services ?
            </h2>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
              Rejoignez la révolution numérique et offrez à vos citoyens
              des services publics dignes du 21ème siècle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="px-8 h-14 text-lg font-bold">
                  Accéder au Portail
                </Button>
              </Link>
              <Link href="/auth/register-citizen">
                <Button size="lg" variant="default" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 h-14 text-lg">
                  Créer un Compte
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
