export interface SessionProduct {
  id: string
  name: string
  duration: string
  fullPriceInCents: number
  depositPriceInCents: number // 50% deposit
}

// Session products with 50% deposit pricing
export const SESSION_PRODUCTS: SessionProduct[] = [
  {
    id: "30min",
    name: "Quick Session (30 minutes)",
    duration: "30 minutes",
    fullPriceInCents: 15000, // $150
    depositPriceInCents: 7500, // $75 (50%)
  },
  {
    id: "1hr",
    name: "Standard Session (1 hour)",
    duration: "1 hour",
    fullPriceInCents: 27500, // $275
    depositPriceInCents: 13750, // $137.50 (50%)
  },
  {
    id: "2hr",
    name: "Extended Session (2 hours)",
    duration: "2 hours",
    fullPriceInCents: 50000, // $500
    depositPriceInCents: 25000, // $250 (50%)
  },
  {
    id: "4hr",
    name: "Half Day Session (4 hours)",
    duration: "4 hours",
    fullPriceInCents: 95000, // $950
    depositPriceInCents: 47500, // $475 (50%)
  },
  {
    id: "8hr",
    name: "Full Day Session (8 hours)",
    duration: "8 hours",
    fullPriceInCents: 180000, // $1,800
    depositPriceInCents: 90000, // $900 (50%)
  },
]

export function getSessionProduct(id: string): SessionProduct | undefined {
  return SESSION_PRODUCTS.find((p) => p.id === id)
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100)
}
