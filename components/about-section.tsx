import Image from "next/image"

const stats = [
  { value: "150+", label: "Projects Completed" },
  { value: "50+", label: "Happy Clients" },
  { value: "5+", label: "Years Experience" },
  { value: "10+", label: "Awards Won" },
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] relative overflow-hidden">
                  <Image
                    src="/images/portfolio-1.jpg"
                    alt="Studio work"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src="/images/portfolio-4.jpg"
                    alt="Event photography"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src="/images/portfolio-3.jpg"
                    alt="Corporate video"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="aspect-[3/4] relative overflow-hidden">
                  <Image
                    src="/images/portfolio-5.jpg"
                    alt="Aerial cinematography"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-8 -left-8 w-32 h-32 border border-accent/30 -z-10" />
          </div>

          {/* Content */}
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
              About NT Media
            </p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 text-balance">
              Dedicated to Visual Excellence
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-10">
              <p>
                NT Media is a premier visual storytelling studio founded on the
                belief that every story deserves to be told with artistry and
                intention. We combine technical expertise with creative vision
                to produce content that resonates.
              </p>
              <p>
                Whether it is a meticulously scripted commercial or a raw,
                unscripted documentary, we approach each project with the same
                dedication to quality and authenticity. Our team brings together
                diverse backgrounds in film, photography, and digital media.
              </p>
              <p>
                We work closely with brands, businesses, and individuals who
                understand that powerful visuals are not just content—they are
                connections. Let us help you tell your story.
              </p>
            </div>

            {/* Stats */}
            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-border">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div> */}
          </div>
        </div>
      </div>
    </section>
  )
}
