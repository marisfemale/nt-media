import { Camera, Film, Video, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const services = [
  {
    icon: Camera,
    title: "Photography",
    description:
      "From editorial and commercial shoots to portraits and events, we capture moments with artistic precision and technical excellence.",
    features: ["Commercial & Editorial", "Portraits & Headshots", "Product Photography", "Event Documentation"],
  },
  {
    icon: Film,
    title: "Scripted Video",
    description:
      "Carefully crafted narratives brought to life through cinematic storytelling. Commercials, brand films, and short-form content.",
    features: ["Brand Films", "Commercials", "Music Videos", "Short Films"],
  },
  {
    icon: Video,
    title: "Unscripted Video",
    description:
      "Authentic storytelling through documentary-style filming. We capture real moments that resonate with audiences.",
    features: ["Documentaries", "Event Coverage", "Wedding Films", "Behind-the-Scenes"],
  },
  {
    icon: Sparkles,
    title: "Post-Production",
    description:
      "Professional editing, color grading, and finishing that elevates your content to cinematic quality.",
    features: ["Video Editing", "Color Grading", "Sound Design", "Motion Graphics"],
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-24 md:py-32 bg-secondary">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
            What We Offer
          </p>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 text-balance">
            End-to-End Visual Production
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From concept to final delivery, we handle every aspect of visual
            storytelling with meticulous attention to detail.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => (
            <article
              key={service.title}
              className="group p-8 md:p-10 border border-border bg-card hover:bg-card/80 transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className="p-4 bg-background border border-border">
                  <service.icon size={28} className="text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <ul className="grid grid-cols-2 gap-2">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="text-sm text-muted-foreground flex items-center gap-2"
                      >
                        <span className="w-1 h-1 bg-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Section CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Ready to bring your vision to life? Let&apos;s discuss your project.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6"
          >
            <Link href="#booking" className="flex items-center gap-2">
              Book a Free Consultation
              <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
