import { FileText, Users, Video, Clapperboard, Camera, Mic, Scissors, Sparkles, Film, Send } from "lucide-react"

const phases = [
  {
    id: "pre-production",
    number: "01",
    title: "Pre-Production",
    subtitle: "Planning & Preparation",
    description:
      "Every successful project starts with meticulous planning. We lay the groundwork to ensure a smooth production.",
    steps: [
      {
        icon: Users,
        title: "Discovery & Consultation",
        description: "Understanding your vision, goals, target audience, and project requirements.",
      },
      {
        icon: FileText,
        title: "Creative Development",
        description: "Scripting, storyboarding, mood boards, and visual treatment development.",
      },
      {
        icon: Clapperboard,
        title: "Production Planning",
        description: "Location scouting, casting, scheduling, equipment planning, and crew assembly.",
      },
    ],
  },
  {
    id: "production",
    number: "02",
    title: "Production",
    subtitle: "Capture & Creation",
    description:
      "Where the magic happens. Our experienced team brings your vision to life with precision and artistry.",
    steps: [
      {
        icon: Camera,
        title: "Photography",
        description: "Professional photo sessions with expert lighting, composition, and direction.",
      },
      {
        icon: Video,
        title: "Videography",
        description: "Cinematic footage capture using state-of-the-art cameras and equipment.",
      },
      {
        icon: Mic,
        title: "Audio & Direction",
        description: "Crystal-clear audio recording and on-set creative direction.",
      },
    ],
  },
  {
    id: "post-production",
    number: "03",
    title: "Post-Production",
    subtitle: "Polish & Perfect",
    description:
      "Raw footage transforms into compelling content through our comprehensive post-production process.",
    steps: [
      {
        icon: Scissors,
        title: "Editing & Assembly",
        description: "Expert cutting, pacing, and narrative flow to tell your story effectively.",
      },
      {
        icon: Sparkles,
        title: "Color & Effects",
        description: "Professional color grading, motion graphics, and visual effects.",
      },
      {
        icon: Film,
        title: "Sound Design",
        description: "Audio mixing, music selection, sound effects, and voiceover integration.",
      },
    ],
  },
]

export function ProcessSection() {
  return (
    <section className="py-24 md:py-32 bg-secondary">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-20">
          <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
            Our Process
          </p>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 text-balance">
            From Concept to Completion
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our proven three-phase workflow ensures every project is executed with precision, 
            creativity, and attention to detail.
          </p>
        </div>

        {/* Process Phases */}
        <div className="space-y-16 lg:space-y-24">
          {phases.map((phase, phaseIndex) => (
            <div key={phase.id} className="relative">
              {/* Phase Header */}
              <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16 mb-12">
                <div className="lg:w-1/3">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl md:text-6xl font-serif font-bold text-accent/30">
                      {phase.number}
                    </span>
                    <div className="h-px flex-1 bg-accent/20 lg:hidden" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
                    {phase.title}
                  </h3>
                  <p className="text-accent font-medium mb-3">{phase.subtitle}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {phase.description}
                  </p>
                </div>

                {/* Steps Grid */}
                <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {phase.steps.map((step) => (
                    <div
                      key={step.title}
                      className="group bg-card border border-border rounded-lg p-6 hover:border-accent/50 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                        <step.icon className="w-6 h-6 text-accent" />
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">
                        {step.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector */}
              {phaseIndex < phases.length - 1 && (
                <div className="flex items-center justify-center lg:justify-start lg:pl-8">
                  <div className="w-px h-12 bg-gradient-to-b from-accent/40 to-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Final Delivery CTA */}
        <div className="mt-20 pt-16 border-t border-border">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-card border border-border rounded-xl p-8 lg:p-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Send className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h4 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-1">
                  Final Delivery
                </h4>
                <p className="text-muted-foreground">
                  Polished content delivered in your preferred formats, optimized for all platforms.
                </p>
              </div>
            </div>
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-accent text-accent-foreground font-medium rounded-md hover:bg-accent/90 transition-colors whitespace-nowrap"
            >
              Start Your Project
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
