import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { requireAdminRequest } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"

const gallerySchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  client_name: z.string().min(1),
  client_email: z.string().email(),
  shoot_date: z.string().nullable().optional(),
  is_public: z.boolean().default(false),
  access_code: z.string().min(1),
})

export async function POST(request: NextRequest) {
  if (!(await requireAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const result = gallerySchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid gallery details", details: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const gallery = result.data

  try {
    const created = await prisma.gallery.create({
      data: {
        ...gallery,
        access_code: gallery.access_code.toUpperCase(),
        shoot_date: gallery.shoot_date ? new Date(gallery.shoot_date) : null,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Access code already exists" }, { status: 409 })
    }

    console.error("Could not create gallery", error)
    return NextResponse.json({ error: "Could not create gallery" }, { status: 500 })
  }
}
