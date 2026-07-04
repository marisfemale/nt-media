import "server-only"

import { getAdminSettings } from "@/lib/app-settings"

interface BookingEmailDetails {
  booking_reference?: string | null
  name: string
  email: string
  phone?: string | null
  service_type: string
  booking_date: Date
  booking_time: string
  project_description?: string | null
  budget_range?: string | null
  payment_method?: string | null
  status: string
}

function formatBookingDate(date: Date) {
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function bookingEmailText(booking: BookingEmailDetails) {
  return [
    "New booking received",
    "",
    `Reference: ${booking.booking_reference || "Not provided"}`,
    `Client: ${booking.name}`,
    `Email: ${booking.email}`,
    booking.phone ? `Phone: ${booking.phone}` : "",
    `Service: ${booking.service_type.replace(/-/g, " ")}`,
    `Date: ${formatBookingDate(booking.booking_date)}`,
    `Time: ${booking.booking_time}`,
    booking.budget_range ? `Estimate: ${booking.budget_range}` : "",
    booking.payment_method ? `Payment: ${booking.payment_method}` : "",
    `Status: ${booking.status.replace(/_/g, " ")}`,
    "",
    booking.project_description ? `Project:\n${booking.project_description}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

export async function notifyAdminOfBooking(booking: BookingEmailDetails) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.BOOKING_EMAIL_FROM || "NT Media <onboarding@resend.dev>"
    const { adminEmail } = await getAdminSettings()
    const text = bookingEmailText(booking)

    if (!resendApiKey || resendApiKey === "re_your_resend_api_key") {
      console.info("Booking email notification skipped; RESEND_API_KEY is not configured.", {
        adminEmail,
        bookingReference: booking.booking_reference,
      })
      return
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: adminEmail,
        subject: `New booking: ${booking.name} - ${formatBookingDate(booking.booking_date)}`,
        text,
      }),
    })

    if (!response.ok) {
      console.error("Booking email notification failed", await response.text())
    }
  } catch (error) {
    console.error("Booking email notification failed", error)
  }
}
