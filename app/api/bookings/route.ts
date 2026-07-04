import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { notifyAdminOfBooking } from "@/lib/booking-email"
import { prisma } from "@/lib/db"

const bookingSchema = z.object({
  booking_reference: z.string().trim().max(64).nullable().optional(),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).nullable().optional(),
  service_type: z.string().trim().min(1).max(80),
  booking_date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid booking date",
  }),
  booking_time: z.string().trim().min(1).max(200),
  booking_start_time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  duration_minutes: z.number().int().positive().max(24 * 60).nullable().optional(),
  project_description: z.string().trim().max(2000).nullable().optional(),
  budget_range: z.string().trim().max(100).nullable().optional(),
  payment_method: z.enum(["card", "bank"]).nullable().optional(),
  status: z.enum(["pending", "pending_payment", "confirmed"]).default("pending"),
})

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const result = bookingSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid booking details", details: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const booking = result.data
  const bookingDate = new Date(booking.booking_date)

  try {
    const created = await prisma.booking.create({
      data: {
        ...booking,
        booking_date: bookingDate,
      },
    })

    await notifyAdminOfBooking(created)
  } catch {
    return NextResponse.json({ error: "Could not save booking" }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
