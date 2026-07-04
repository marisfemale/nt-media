import "server-only"

import { prisma } from "@/lib/db"
import { DEFAULT_SESSION_PRODUCTS, type SessionProduct } from "@/lib/products"

function toSessionProduct(product: {
  id: string
  label: string
  duration: string
  description: string
  fullPriceInCents: number
  depositPriceInCents: number
  isActive: boolean
  sortOrder: number
}): SessionProduct {
  return {
    id: product.id,
    name: `${product.label} (${product.duration})`,
    label: product.label,
    duration: product.duration,
    description: product.description,
    fullPriceInCents: product.fullPriceInCents,
    depositPriceInCents: product.depositPriceInCents,
    isActive: product.isActive,
    sortOrder: product.sortOrder,
  }
}

export async function ensureDefaultSessionPackages() {
  const existingPackages = await prisma.sessionPackage.findMany({
    select: { id: true },
  })
  const existingIds = new Set(existingPackages.map((product) => product.id))
  const missingProducts = DEFAULT_SESSION_PRODUCTS.filter(
    (product) => !existingIds.has(product.id)
  )

  if (missingProducts.length === 0) return

  await prisma.sessionPackage.createMany({
    data: missingProducts.map((product) => ({
      id: product.id,
      label: product.label,
      duration: product.duration,
      description: product.description,
      fullPriceInCents: product.fullPriceInCents,
      depositPriceInCents: product.depositPriceInCents,
      isActive: product.isActive,
      sortOrder: product.sortOrder,
    })),
    skipDuplicates: true,
  })
}

export async function listSessionPackages(options?: { includeInactive?: boolean }) {
  await ensureDefaultSessionPackages()

  const products = await prisma.sessionPackage.findMany({
    where: options?.includeInactive ? undefined : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  })

  return products.map(toSessionProduct)
}

export async function getSessionPackage(id: string) {
  await ensureDefaultSessionPackages()

  const product = await prisma.sessionPackage.findUnique({
    where: { id },
  })

  return product ? toSessionProduct(product) : undefined
}
