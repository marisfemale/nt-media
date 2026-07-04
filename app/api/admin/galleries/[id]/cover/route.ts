import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { requireAdminRequest } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { galleryImageUrlSchema } from "@/lib/gallery-image-url"

const coverSchema = z.object({
  cover_image_url: galleryImageUrlSchema,
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { cover_image_url } = coverSchema.parse(body)

  const updated = await prisma.gallery.update({
    where: { id },
    data: { cover_image_url },
  })

  return NextResponse.json(updated)
}
