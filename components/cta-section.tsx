import { ArrowRight, Play, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="py-24 md:py-32 bg-card relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:60px_60px]" />
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
            Ready to Start?
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 text-balance">
            Let&apos;s Create Something Extraordinary Together
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Every great story deserves to be told beautifully. Whether it&apos;s a
            brand film, documentary, or photo session, we&apos;re here to bring your
            vision to life.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg group"
            >
              <a href="#booking">
                <Calendar className="w-5 h-5 mr-2" />
                Book a Session
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-foreground/20 text-foreground hover:bg-foreground/5 px-8 py-6 text-lg group bg-transparent"
            >
              <a href="#portfolio">
                <Play className="w-5 h-5 mr-2" />
                View Our Work
              </a>
            </Button>
          </div>

          {/* Trust Indicators */}
          {/* <div className="mt-16 pt-10 border-t border-border">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-muted-foreground">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-1">
                  200+
                </div>
                <div className="text-sm">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-1">
                  50+
                </div>
                <div className="text-sm">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-1">
                  8+
                </div>
                <div className="text-sm">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-1">
                  15+
                </div>
                <div className="text-sm">Industry Awards</div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  )
}
