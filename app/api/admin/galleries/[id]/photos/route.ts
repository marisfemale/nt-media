import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { requireAdminRequest } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { galleryImageUrlSchema } from "@/lib/gallery-image-url"

const photoSchema = z.object({
  image_url: galleryImageUrlSchema,
  is_public: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const photo = photoSchema.parse(body)

  const created = await prisma.galleryPhoto.create({
    data: {
      gallery_id: id,
      image_url: photo.image_url,
      is_public: photo.is_public,
      sort_order: photo.sort_order,
    },
  })

  return NextResponse.json(created, { status: 201 })
}
