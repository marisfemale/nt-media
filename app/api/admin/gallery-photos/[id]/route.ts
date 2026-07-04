import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { requireAdminRequest } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"

const photoUpdateSchema = z.object({
  is_public: z.boolean().optional(),
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
  const data = photoUpdateSchema.parse(body)

  const updated = await prisma.galleryPhoto.update({
    where: { id },
    data,
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  await prisma.galleryPhoto.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
