"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowDown, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-cinematography.jpg"
          alt="Professional cinematography setup"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tagline */}
          <p className="text-sm uppercase tracking-[0.4em] text-accent mb-6 animate-fade-in">
            Visual Storytelling Studio
          </p>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-[1.1] mb-8 text-balance">
            We Craft Stories That Move People
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Premium photography and videography services for brands, businesses,
            and visionaries who demand excellence. Scripted narratives.
            Unscripted moments. Unforgettable visuals.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-none px-8 py-6 text-sm uppercase tracking-widest"
            >
              <Link href="#booking" className="flex items-center gap-3">
                <Calendar size={16} />
                Book a Session
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 rounded-none px-8 py-6 text-sm uppercase tracking-widest"
            >
              <Link href="#work">View Our Work</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <Link
          href="#work"
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ArrowDown
            size={20}
            className="animate-bounce group-hover:text-accent"
          />
        </Link>
      </div>

      {/* Side Text */}
      <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground -rotate-90 origin-center whitespace-nowrap">
          Photography & Videography
        </p>
      </div>

      <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground rotate-90 origin-center whitespace-nowrap">
          Darwin, NT
        </p>
      </div>
    </section>
  )
}
