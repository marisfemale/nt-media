import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"

const accessRequestSchema = z.object({
  gallery_id: z.string().uuid(),
  requester_name: z.string().min(1),
  requester_email: z.string().email(),
  reason: z.string().nullable().optional(),
  access_token: z.string().min(1),
  token_expires_at: z.string(),
  is_approved: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const accessRequest = accessRequestSchema.parse(body)

  await prisma.galleryAccessRequest.create({
    data: {
      ...accessRequest,
      token_expires_at: new Date(accessRequest.token_expires_at),
    },
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
