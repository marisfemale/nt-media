const appointmentStartTimes = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
]

const endOfBookingDayInMinutes = 18 * 60

function padDatePart(value: number) {
  return String(value).padStart(2, "0")
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number) {
  const nextDate = startOfDay(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

export function toDateInputValue(date: Date) {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-")
}

export function dateFromInputValue(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined

  return new Date(year, month - 1, day)
}

export function getDateKey(date: Date) {
  return toDateInputValue(date)
}

export function isSameDay(firstDate: Date, secondDate: Date) {
  return getDateKey(firstDate) === getDateKey(secondDate)
}

function isSunday(date: Date) {
  return date.getDay() === 0
}

function isPastDate(date: Date) {
  return startOfDay(date) < startOfDay(new Date())
}

function isBlockedDate(date: Date, blockedDates: Date[]) {
  const dateKey = getDateKey(date)
  return blockedDates.some((blockedDate) => getDateKey(blockedDate) === dateKey)
}

export function isBookableDate(date: Date, blockedDates: Date[]) {
  return !isPastDate(date) && !isSunday(date) && !isBlockedDate(date, blockedDates)
}

export function getInitialAppointmentDate() {
  let date = startOfDay(new Date())

  while (isSunday(date)) {
    date = addDays(date, 1)
  }

  return date
}

export function getAvailableAppointmentDays(startDate: Date, blockedDates: Date[]) {
  const days: Date[] = []
  let candidateDate = startOfDay(startDate)

  for (let dayOffset = 0; days.length < 3 && dayOffset < 45; dayOffset += 1) {
    if (isBookableDate(candidateDate, blockedDates)) {
      days.push(candidateDate)
    }

    candidateDate = addDays(candidateDate, 1)
  }

  return days
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${padDatePart(hours)}:${padDatePart(minutes)}`
}

export function formatTimeLabel(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "pm" : "am"
  const displayHour = hours % 12 || 12

  return `${displayHour}:${padDatePart(minutes)} ${period}`
}

export function parseDurationMinutes(duration: string) {
  const hourMatch = duration.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)/i)
  const minuteMatch = duration.match(/(\d+)\s*(m|min|mins|minute|minutes)/i)
  const hours = hourMatch ? Number.parseFloat(hourMatch[1]) * 60 : 0
  const minutes = minuteMatch ? Number.parseInt(minuteMatch[1], 10) : 0
  const totalMinutes = hours + minutes

  return totalMinutes > 0 ? totalMinutes : 60
}

function isPastStartTime(date: Date, startTime: string) {
  const now = new Date()

  if (!isSameDay(date, now)) return false

  return timeToMinutes(startTime) <= now.getHours() * 60 + now.getMinutes()
}

export function isStartTimeAvailable(
  date: Date,
  startTime: string,
  durationMinutes: number
) {
  const startMinutes = timeToMinutes(startTime)

  return (
    !isPastStartTime(date, startTime) &&
    startMinutes + durationMinutes <= endOfBookingDayInMinutes
  )
}

export function getStartTimesForDay(date: Date, durationMinutes: number) {
  return appointmentStartTimes.filter((startTime) =>
    isStartTimeAvailable(date, startTime, durationMinutes)
  )
}

export function formatDayHeading(date: Date) {
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

export function formatFullDate(date?: Date) {
  if (!date) return ""

  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function getTimePeriodCopy(startTime: string) {
  const startMinutes = timeToMinutes(startTime)

  if (startMinutes < 10 * 60) {
    return {
      title: "Morning start",
      body: "Best for crisp natural light, calmer locations, and a clean start for portraits, product work, or focused studio sessions.",
    }
  }

  if (startMinutes < 13 * 60) {
    return {
      title: "Late morning start",
      body: "A practical window for controlled lighting, commercial setups, indoor production, and shoots that need a steady daytime pace.",
    }
  }

  if (startMinutes < 16 * 60) {
    return {
      title: "Afternoon start",
      body: "Good for brand content, lifestyle coverage, social media work, and location shoots with enough room to move between setups.",
    }
  }

  return {
    title: "Late afternoon start",
    body: "Ideal when you want warmer, more cinematic light for portraits, couples, outdoor lifestyle visuals, and golden-hour scenes.",
  }
}

function getDurationCopy(durationMinutes: number) {
  if (durationMinutes >= 8 * 60) {
    return "A full-day booking gives us space for multiple locations, setup changes, and a slower production rhythm."
  }

  if (durationMinutes >= 4 * 60) {
    return "This length is strong for bigger shoots, events, or commercial work where setup and coverage both matter."
  }

  if (durationMinutes >= 2 * 60) {
    return "This gives enough room for a clear creative brief, a few variations, and a polished set of final options."
  }

  if (durationMinutes >= 60) {
    return "This is a focused session for a single setup, short portrait run, small product batch, or simple content capture."
  }

  return "This is a tight, efficient slot for headshots, a single product, or a quick update when the brief is already clear."
}

export function getAppointmentDescription(startTime: string, durationMinutes: number) {
  const periodCopy = getTimePeriodCopy(startTime)
  const finishTime = minutesToTime(timeToMinutes(startTime) + durationMinutes)

  return {
    title: periodCopy.title,
    body: `${periodCopy.body} ${getDurationCopy(durationMinutes)}`,
    finishTime,
  }
}
