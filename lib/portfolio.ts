import "server-only"

import { prisma } from "@/lib/db"

export interface PortfolioItem {
  id: string
  title: string
  category: string
  image: string
  description: string
  cta: string
  href: string
}

export async function listPortfolioItems(): Promise<PortfolioItem[]> {
  const galleries = await prisma.gallery.findMany({
    where: {
      is_public: true,
      portfolio_enabled: true,
    },
    orderBy: [{ portfolio_sort_order: "asc" }, { created_at: "desc" }],
    include: {
      photos: {
        where: { is_public: true },
        orderBy: { sort_order: "asc" },
        take: 1,
      },
    },
  })

  return galleries.map((gallery) => ({
    id: gallery.id,
    title: gallery.title,
    category: gallery.portfolio_category,
    image: gallery.cover_image_url || gallery.photos[0]?.image_url || "/placeholder.svg",
    description: gallery.description || `Gallery for ${gallery.client_name}`,
    cta: gallery.portfolio_cta || "View gallery",
    href: `/gallery/${gallery.access_code}`,
  }))
}
