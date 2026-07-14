import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { verifyCardDetailsPayment } from "@/app/actions/stripe"
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
  session_id: z.string().trim().max(80).nullable().optional(),
  payment_intent_id: z.string().trim().max(120).nullable().optional(),
  payment_method: z.enum(["card", "card_details", "bank"]).nullable().optional(),
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

  const { payment_intent_id: paymentIntentId, session_id: sessionId, ...booking } = result.data
  const bookingDate = new Date(booking.booking_date)

  try {
    if (booking.payment_method === "card_details") {
      if (!paymentIntentId || !sessionId || !booking.booking_reference) {
        return NextResponse.json(
          { error: "Card details payment could not be verified" },
          { status: 400 }
        )
      }

      const verification = await verifyCardDetailsPayment(
        paymentIntentId,
        booking.booking_reference,
        sessionId
      )

      if (!verification.success) {
        return NextResponse.json(
          { error: "Card details payment could not be verified" },
          { status: 402 }
        )
      }
    }

    const created = await prisma.booking.create({
      data: {
        ...booking,
        booking_date: bookingDate,
        status: booking.payment_method === "card_details" ? "confirmed" : booking.status,
      },
    })

    await notifyAdminOfBooking(created)
  } catch {
    return NextResponse.json({ error: "Could not save booking" }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
