import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { requireAdminRequest } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"

const galleryUpdateSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  client_name: z.string().min(1),
  client_email: z.string().email(),
  shoot_date: z.string().nullable().optional(),
  is_public: z.boolean(),
  access_code: z.string().min(1),
  portfolio_enabled: z.boolean().default(false),
  portfolio_category: z.string().trim().min(1).max(80).default("Photography"),
  portfolio_cta: z.string().trim().max(120).nullable().optional(),
  portfolio_sort_order: z.number().int().min(0).default(0),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const gallery = await prisma.gallery.findUnique({
    where: { id },
    include: {
      photos: {
        orderBy: { sort_order: "asc" },
      },
    },
  })

  if (!gallery) {
    return NextResponse.json({ error: "Gallery not found" }, { status: 404 })
  }

  return NextResponse.json({
    gallery: {
      id: gallery.id,
      title: gallery.title,
      description: gallery.description,
      client_name: gallery.client_name,
      client_email: gallery.client_email,
      shoot_date: gallery.shoot_date,
      access_code: gallery.access_code,
      is_public: gallery.is_public,
      cover_image_url: gallery.cover_image_url,
      portfolio_enabled: gallery.portfolio_enabled,
      portfolio_category: gallery.portfolio_category,
      portfolio_cta: gallery.portfolio_cta,
      portfolio_sort_order: gallery.portfolio_sort_order,
    },
    photos: gallery.photos,
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const result = galleryUpdateSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid gallery details", details: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const gallery = result.data

  try {
    const updated = await prisma.gallery.update({
      where: { id },
      data: {
        ...gallery,
        access_code: gallery.access_code.toUpperCase(),
        shoot_date: gallery.shoot_date ? new Date(gallery.shoot_date) : null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Access code already exists" }, { status: 409 })
    }

    console.error("Could not update gallery", error)
    return NextResponse.json({ error: "Could not update gallery" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  await prisma.gallery.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
