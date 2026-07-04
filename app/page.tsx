import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { PortfolioSection } from "@/components/portfolio-section"
import { ServicesSection } from "@/components/services-section"
import { AboutSection } from "@/components/about-section"
import { ProcessSection } from "@/components/process-section"
import { BookingSection } from "@/components/booking-section"
import { CtaSection } from "@/components/cta-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { listPortfolioItems } from "@/lib/portfolio"
import { listSessionPackages } from "@/lib/session-packages"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [sessionPackages, portfolioItems] = await Promise.all([
    listSessionPackages(),
    listPortfolioItems(),
  ])

  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <PortfolioSection items={portfolioItems} />
      <ServicesSection />
      <AboutSection />
      <ProcessSection />
      <BookingSection sessionPackages={sessionPackages} />
      <CtaSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
