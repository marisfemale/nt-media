import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"

const contactInquirySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).nullable().optional(),
  project_type: z.string().trim().min(1).max(80),
  message: z.string().trim().min(10).max(2000),
})

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const result = contactInquirySchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid inquiry details", details: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const inquiry = result.data

  try {
    await prisma.contactInquiry.create({
      data: {
        ...inquiry,
        phone: inquiry.phone || null,
      },
    })
  } catch {
    return NextResponse.json({ error: "Could not save inquiry" }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
