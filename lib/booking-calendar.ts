import "server-only"

interface BookingCalendarDetails {
  id: string
  booking_reference?: string | null
  name: string
  email: string
  phone?: string | null
  service_type: string
  booking_date: Date
  booking_time: string
  booking_start_time?: string | null
  duration_minutes?: number | null
  project_description?: string | null
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

function formatDatePart(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "")
}

function parseStartTime(booking: BookingCalendarDetails) {
  const match = booking.booking_start_time?.match(/^(\d{2}):(\d{2})$/)

  if (!match) return { hours: 9, minutes: 0 }

  return {
    hours: Number.parseInt(match[1], 10),
    minutes: Number.parseInt(match[2], 10),
  }
}

function addMinutes(hours: number, minutes: number, durationMinutes: number) {
  const totalMinutes = hours * 60 + minutes + durationMinutes

  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  }
}

function formatFloatingDateTime(date: Date, hours: number, minutes: number) {
  return `${formatDatePart(date)}T${pad(hours)}${pad(minutes)}00`
}

function formatUtcTimestamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")
}

function foldLine(line: string) {
  if (line.length <= 74) return line

  const chunks: string[] = []
  let remaining = line

  while (remaining.length > 74) {
    chunks.push(remaining.slice(0, 74))
    remaining = ` ${remaining.slice(74)}`
  }

  chunks.push(remaining)
  return chunks.join("\r\n")
}

export function buildBookingCalendar(booking: BookingCalendarDetails) {
  const start = parseStartTime(booking)
  const durationMinutes = booking.duration_minutes || 60
  const end = addMinutes(start.hours, start.minutes, durationMinutes)
  const summary = `${booking.name} - ${booking.service_type.replace(/-/g, " ")}`
  const description = [
    booking.booking_time,
    booking.email,
    booking.phone ? `Phone: ${booking.phone}` : "",
    booking.project_description || "",
  ]
    .filter(Boolean)
    .join("\n")

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NT Media//Booking Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.id}@nt-media`,
    `DTSTAMP:${formatUtcTimestamp(new Date())}`,
    `DTSTART:${formatFloatingDateTime(booking.booking_date, start.hours, start.minutes)}`,
    `DTEND:${formatFloatingDateTime(booking.booking_date, end.hours, end.minutes)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `CONTACT:${escapeIcsText(booking.email)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(foldLine)
    .join("\r\n")
}
