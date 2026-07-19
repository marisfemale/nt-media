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

function bookingDetails(booking: BookingEmailDetails) {
  const paymentMethod = booking.payment_method?.replace(/_/g, " ")

  return [
    `Reference: ${booking.booking_reference || "Not provided"}`,
    `Service: ${booking.service_type.replace(/-/g, " ")}`,
    `Date: ${formatBookingDate(booking.booking_date)}`,
    `Time: ${booking.booking_time}`,
    booking.budget_range ? `Estimate: ${booking.budget_range}` : "",
    paymentMethod ? `Payment: ${paymentMethod}` : "",
    `Status: ${booking.status.replace(/_/g, " ")}`,
  ]
    .filter(Boolean)
}

function adminBookingEmailText(booking: BookingEmailDetails) {
  return [
    "New booking received",
    "",
    `Client: ${booking.name}`,
    `Email: ${booking.email}`,
    booking.phone ? `Phone: ${booking.phone}` : "",
    ...bookingDetails(booking),
    "",
    booking.project_description ? `Project:\n${booking.project_description}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

function customerBookingEmailText(booking: BookingEmailDetails) {
  const isConfirmed = booking.status === "confirmed"

  return [
    `Hi ${booking.name},`,
    "",
    isConfirmed
      ? "Your NT Media booking is confirmed and your deposit payment has been received."
      : "We have received your NT Media booking request. Your booking will be confirmed after we receive your deposit payment.",
    "",
    ...bookingDetails(booking),
    "",
    isConfirmed
      ? "Please keep your booking reference for future correspondence."
      : "Please use your booking reference when completing your bank transfer and in any correspondence.",
    "",
    "If any of these details are incorrect, please reply to this email or contact NT Media.",
    "",
    "NT Media",
  ].join("\n")
}

async function sendBookingEmail({
  resendApiKey,
  fromEmail,
  to,
  subject,
  text,
  kind,
  bookingReference,
}: {
  resendApiKey: string
  fromEmail: string
  to: string
  subject: string
  text: string
  kind: "admin" | "customer"
  bookingReference?: string | null
}) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to,
        subject,
        text,
      }),
    })

    if (!response.ok) {
      console.error(`${kind} booking email failed`, {
        status: response.status,
        bookingReference,
        providerResponse: await response.text(),
      })
      return false
    }

    return true
  } catch (error) {
    console.error(`${kind} booking email failed`, {
      bookingReference,
      error,
    })
    return false
  }
}

export async function notifyBookingParties(booking: BookingEmailDetails) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.BOOKING_EMAIL_FROM || "NT Media <onboarding@resend.dev>"

    if (!resendApiKey || resendApiKey === "re_your_resend_api_key") {
      console.info("Booking email notifications skipped; RESEND_API_KEY is not configured.", {
        bookingReference: booking.booking_reference,
      })
      return { adminAccepted: false, customerAccepted: false }
    }

    const { adminEmail } = await getAdminSettings()
    const customerSubject =
      booking.status === "confirmed"
        ? `Booking confirmed: ${booking.booking_reference || "NT Media"}`
        : `Booking request received: ${booking.booking_reference || "NT Media"}`

    const [adminAccepted, customerAccepted] = await Promise.all([
      sendBookingEmail({
        resendApiKey,
        fromEmail,
        to: adminEmail,
        subject: `New booking: ${booking.name} - ${formatBookingDate(booking.booking_date)}`,
        text: adminBookingEmailText(booking),
        kind: "admin",
        bookingReference: booking.booking_reference,
      }),
      sendBookingEmail({
        resendApiKey,
        fromEmail,
        to: booking.email,
        subject: customerSubject,
        text: customerBookingEmailText(booking),
        kind: "customer",
        bookingReference: booking.booking_reference,
      }),
    ])

    return { adminAccepted, customerAccepted }
  } catch (error) {
    console.error("Booking email notifications failed", {
      bookingReference: booking.booking_reference,
      error,
    })
    return { adminAccepted: false, customerAccepted: false }
  }
}
