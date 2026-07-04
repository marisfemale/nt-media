import { NextResponse, type NextRequest } from "next/server"

import { requireAdminRequest } from "@/lib/admin-auth"
import { buildBookingCalendar } from "@/lib/booking-calendar"
import { prisma } from "@/lib/db"

function safeFilename(value: string) {
  return (
    value
      .trim()
      .replace(/[^a-z0-9._-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "booking"
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const booking = await prisma.booking.findUnique({ where: { id } })

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  const calendar = buildBookingCalendar(booking)
  const filename = `${safeFilename(booking.booking_reference || booking.name)}.ics`

  return new NextResponse(calendar, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/calendar; charset=utf-8",
    },
  })
}
