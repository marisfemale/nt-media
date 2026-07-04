"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Images } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PortfolioItem {
  id: string
  title: string
  category: string
  image: string
  description: string
  cta: string
  href: string
}

export function PortfolioSection({ items }: { items: PortfolioItem[] }) {
  const [activeCategory, setActiveCategory] = useState("All")
  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category)))]

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory)

  return (
    <section id="work" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
            Selected Work
          </p>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 text-balance">
            Stories We Have Told
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Each project is a unique narrative, crafted with precision and
            passion. From intimate moments to grand productions, we bring your
            vision to life.
          </p>
        </div>

        {/* Category Filter */}
        {items.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-12" aria-label="Filter portfolio by service type">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`min-h-11 px-5 py-2 text-sm uppercase tracking-widest transition-all ${
                  activeCategory === category
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Portfolio Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden border border-border bg-card"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 px-3 py-1 bg-background/90 backdrop-blur-sm">
                  <span className="text-xs uppercase tracking-widest text-foreground">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-widest text-accent mb-2">
                  {item.category}
                </p>
                <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground mb-5">
                  {item.description}
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Link href={item.href}>
                    <Images size={16} />
                    {item.cta}
                  </Link>
                </Button>
              </div>
            </article>
          ))}
          </div>
        ) : (
          <div className="border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Selected galleries will appear here after they are enabled from the admin area.
            </p>
          </div>
        )}

        {/* Section CTA */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
          <p className="text-muted-foreground text-center sm:text-left">
            Like what you see? Let&apos;s create something amazing together.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 whitespace-nowrap"
          >
            <Link href="#booking" className="flex items-center gap-2">
              <Calendar size={18} />
              Book Your Session
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border px-8 py-6 whitespace-nowrap"
          >
            <Link href="/gallery/browse" className="flex items-center gap-2">
              <Images size={18} />
              View Public Galleries
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
