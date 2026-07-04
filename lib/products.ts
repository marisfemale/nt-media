export interface SessionProduct {
  id: string
  name: string
  label: string
  duration: string
  description: string
  fullPriceInCents: number
  depositPriceInCents: number // 50% deposit
  isActive: boolean
  sortOrder: number
}

// Session products with 50% deposit pricing
export const DEFAULT_SESSION_PRODUCTS: SessionProduct[] = [
  {
    id: "30min",
    name: "Quick Session (30 minutes)",
    label: "Quick Session",
    duration: "30 minutes",
    description: "Perfect for headshots or single product shots",
    fullPriceInCents: 15000, // $150
    depositPriceInCents: 7500, // $75 (50%)
    isActive: true,
    sortOrder: 0,
  },
  {
    id: "1hr",
    name: "Standard Session (1 hour)",
    label: "Standard Session",
    duration: "1 hour",
    description: "Ideal for portraits, small events, or mini projects",
    fullPriceInCents: 27500, // $275
    depositPriceInCents: 13750, // $137.50 (50%)
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "2hr",
    name: "Extended Session (2 hours)",
    label: "Extended Session",
    duration: "2 hours",
    description: "Great for lifestyle shoots or multiple setups",
    fullPriceInCents: 50000, // $500
    depositPriceInCents: 25000, // $250 (50%)
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "4hr",
    name: "Half Day Session (4 hours)",
    label: "Half Day",
    duration: "4 hours",
    description: "Comprehensive coverage for events or commercial work",
    fullPriceInCents: 95000, // $950
    depositPriceInCents: 47500, // $475 (50%)
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "8hr",
    name: "Full Day Session (8 hours)",
    label: "Full Day",
    duration: "8 hours",
    description: "Complete production for large projects or full events",
    fullPriceInCents: 180000, // $1,800
    depositPriceInCents: 90000, // $900 (50%)
    isActive: true,
    sortOrder: 4,
  },
]

export const SESSION_PRODUCTS = DEFAULT_SESSION_PRODUCTS

export function getSessionProduct(id: string): SessionProduct | undefined {
  return DEFAULT_SESSION_PRODUCTS.find((p) => p.id === id)
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100)
}
