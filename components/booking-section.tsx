"use client"

import React, { useEffect, useState } from "react"

import { AlertCircle, CalendarDays, CheckCircle2, Clock, CreditCard, Timer } from "lucide-react"

import {
  DepositPayment,
  type PaymentCompletionDetails,
  type PaymentMethod,
} from "@/components/deposit-payment"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  formatDayHeading,
  formatFullDate,
  formatTimeLabel,
  getAppointmentDescription,
  getDateKey,
  getInitialAppointmentDate,
  getStartTimesForDay,
  isBookableDate,
  isStartTimeAvailable,
  parseDurationMinutes,
  toDateInputValue,
} from "@/lib/booking-appointments"
import { formatPrice, type SessionProduct } from "@/lib/products"

const services = [
  { value: "photography", label: "Photography Session" },
  { value: "scripted-video", label: "Scripted Video Production" },
  { value: "unscripted-video", label: "Unscripted Video / Documentary" },
  { value: "post-production", label: "Post-Production Services" },
  { value: "consultation", label: "Free Consultation" },
]

function generateBookingReference(): string {
  const prefix = "NT"
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function BookingSection({
  sessionPackages,
}: {
  sessionPackages: SessionProduct[]
}) {
  const [appointmentStartDate, setAppointmentStartDate] = useState(() =>
    getInitialAppointmentDate()
  )
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedDuration, setSelectedDuration] = useState("")
  const [selectedStartTime, setSelectedStartTime] = useState("")
  const [blockedDates, setBlockedDates] = useState<Date[]>([])
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [bookingError, setBookingError] = useState("")
  const [bookingReference, setBookingReference] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "",
    projectDescription: "",
  })

  const selectedSession = sessionPackages.find((session) => session.id === selectedDuration)
  const selectedDurationMinutes = selectedSession
    ? parseDurationMinutes(selectedSession.duration)
    : 30
  const selectedDayStartTimes = isBookableDate(appointmentStartDate, blockedDates)
    ? getStartTimesForDay(appointmentStartDate, selectedDurationMinutes)
    : []
  const selectedAppointmentDescription =
    selectedStartTime && selectedSession
      ? getAppointmentDescription(selectedStartTime, selectedDurationMinutes)
      : undefined
  const selectedDateIsUnavailable = !isBookableDate(appointmentStartDate, blockedDates)

  useEffect(() => {
    async function fetchAvailability() {
      const response = await fetch("/api/blocked-dates")
      if (!response.ok) return

      const blocked: { blocked_date: string }[] = await response.json()

      if (blocked) {
        setBlockedDates(blocked.map((blockedDate) => new Date(blockedDate.blocked_date)))
      }
    }

    fetchAvailability()
  }, [])

  const handleAppointmentDateSelect = (date?: Date) => {
    if (!date) return

    setAppointmentStartDate(date)
    setSelectedDate(undefined)
    setSelectedStartTime("")
    setBookingError("")
  }

  const handleDurationSelect = (session: SessionProduct) => {
    const durationMinutes = parseDurationMinutes(session.duration)

    setSelectedDuration(session.id)
    setBookingError("")

    if (
      selectedStartTime &&
      !isStartTimeAvailable(appointmentStartDate, selectedStartTime, durationMinutes)
    ) {
      setSelectedStartTime("")
      setSelectedDate(undefined)
    }
  }

  const handleStartTimeSelect = (startTime: string) => {
    setSelectedDate(appointmentStartDate)
    setSelectedStartTime(startTime)
    setBookingError("")
  }

  const handleProceedToPayment = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedDate || !selectedStartTime || !selectedDuration) return
    if (!formData.name || !formData.email || !formData.serviceType) return

    setBookingReference(generateBookingReference())
    setBookingError("")
    setStep(3)
  }

  const handlePaymentComplete = async (
    method: PaymentMethod,
    details?: PaymentCompletionDetails
  ): Promise<boolean> => {
    if (!selectedDate || !selectedStartTime || !selectedSession) return false

    setPaymentMethod(method)
    setBookingError("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_reference: bookingReference,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          service_type: formData.serviceType,
          booking_date: toDateInputValue(selectedDate),
          booking_start_time: selectedStartTime,
          duration_minutes: selectedDurationMinutes,
          booking_time: `Start ${formatTimeLabel(selectedStartTime)} - ${selectedSession.label} (${selectedSession.duration})`,
          project_description: formData.projectDescription || null,
          budget_range: formatPrice(selectedSession.fullPriceInCents),
          session_id: selectedDuration,
          payment_intent_id: details?.paymentIntentId || null,
          payment_method: method,
          status: method === "bank" ? "pending_payment" : "confirmed",
        }),
      })
      if (!response.ok) {
        setBookingError(
          method === "bank"
            ? "We could not save your booking request. Please try again."
            : "Your payment completed, but we could not save the booking. Please contact us with your booking reference and do not pay again."
        )
        return false
      }

      setIsSuccess(true)
      return true
    } catch {
      setBookingError(
        method === "bank"
          ? "We could not save your booking request. Please try again."
          : "We could not confirm that your paid booking was saved. Please contact us with your booking reference before trying again."
      )
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetBookingForm = () => {
    setIsSuccess(false)
    setStep(1)
    setAppointmentStartDate(getInitialAppointmentDate())
    setSelectedDate(undefined)
    setSelectedDuration("")
    setSelectedStartTime("")
    setBookingReference("")
    setPaymentMethod(null)
    setBookingError("")
    setFormData({
      name: "",
      email: "",
      phone: "",
      serviceType: "",
      projectDescription: "",
    })
  }

  const isCardPayment = paymentMethod === "card" || paymentMethod === "card_details"
  const paymentMethodLabel =
    paymentMethod === "card_details"
      ? "Card details"
      : paymentMethod === "card"
        ? "Apple Pay"
        : "Bank transfer / PayID"

  if (isSuccess) {
    return (
      <section id="booking" className="bg-background py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20">
              <CheckCircle2 className="h-10 w-10 text-accent" />
            </div>
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
              {isCardPayment ? "Booking Confirmed!" : "Booking Request Received!"}
            </h2>
            <p className="mb-4 text-lg text-muted-foreground">
              Thank you, {formData.name}!{" "}
              {isCardPayment
                ? "Your booking has been confirmed."
                : "Your booking will be confirmed once we receive your payment."}
            </p>

            <div className="mb-6 rounded-xl border border-accent/30 bg-accent/10 p-4">
              <p className="mb-1 text-sm text-muted-foreground">Your Booking Reference</p>
              <p className="font-mono text-2xl font-bold text-accent">{bookingReference}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Please save this reference for your records
              </p>
            </div>

            <div className="mb-6 rounded-xl border border-border bg-card p-6 text-left">
              <div className="space-y-3">
                <p className="text-foreground">
                  <span className="font-medium">Date:</span> {formatFullDate(selectedDate)}
                </p>
                <p className="text-foreground">
                  <span className="font-medium">Start time:</span>{" "}
                  {selectedStartTime ? formatTimeLabel(selectedStartTime) : ""}
                </p>
                <p className="text-foreground">
                  <span className="font-medium">Duration:</span> {selectedSession?.label}{" "}
                  ({selectedSession?.duration})
                </p>
                {selectedAppointmentDescription && (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {selectedAppointmentDescription.title}. Estimated finish{" "}
                    {formatTimeLabel(selectedAppointmentDescription.finishTime)}.
                  </p>
                )}
                <div className="mt-3 border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Price</span>
                    <span className="text-foreground">
                      {selectedSession ? formatPrice(selectedSession.fullPriceInCents) : ""}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-accent">
                    <span>
                      {isCardPayment ? "Deposit Paid (50%)" : "Deposit Due (50%)"}
                    </span>
                    <span>
                      {selectedSession ? formatPrice(selectedSession.depositPriceInCents) : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Remaining Balance</span>
                    <span>
                      {selectedSession
                        ? formatPrice(
                            selectedSession.fullPriceInCents -
                              selectedSession.depositPriceInCents
                          )
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Payment Method</span>
                    <span>{paymentMethodLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mb-8 text-muted-foreground">
              {isCardPayment
                ? "A confirmation email has been sent to "
                : "Your booking request has been saved. Once your payment is received, we will send a confirmation email to "}
              <span className="text-accent">{formData.email}</span>
              {paymentMethod === "bank" && " within 1-2 business days."}
            </p>
            <Button
              onClick={resetBookingForm}
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              Book Another Session
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="booking" className="bg-background py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="mb-16 max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-accent">
            Book a Session
          </p>
          <h2 className="mb-6 text-balance font-serif text-3xl font-bold text-foreground md:text-5xl">
            Schedule Your Visual Story
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Choose a start date, pick an available start time, then select the
            session duration that fits your shoot.
          </p>
        </div>

        <div className="mb-12 flex items-center justify-center gap-2 md:gap-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors md:h-10 md:w-10 ${
                  step >= stepNumber
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`mx-1 h-0.5 w-12 transition-colors md:mx-2 md:w-24 ${
                    step > stepNumber ? "bg-accent" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mb-12 grid grid-cols-3 gap-2 text-center text-[11px] sm:text-xs md:flex md:justify-center md:gap-16 md:text-sm">
          <span className={step >= 1 ? "text-foreground" : "text-muted-foreground"}>
            Appointment
          </span>
          <span className={step >= 2 ? "text-foreground" : "text-muted-foreground"}>
            Details
          </span>
          <span className={step >= 3 ? "text-foreground" : "text-muted-foreground"}>
            Deposit
          </span>
        </div>

        <div className="mx-auto max-w-5xl">
          {step === 1 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Choose an appointment start date
                  </h3>
                </div>
                <div className="grid gap-6 lg:grid-cols-[340px_1fr] lg:items-start">
                  <div className="rounded-lg border border-border bg-background p-3">
                    <Calendar
                      mode="single"
                      selected={appointmentStartDate}
                      onSelect={handleAppointmentDateSelect}
                      disabled={(date) => !isBookableDate(date, blockedDates)}
                      defaultMonth={appointmentStartDate}
                      showOutsideDays={false}
                      className="mx-auto"
                    />
                  </div>
                  <div className="space-y-4">
                    <h4
                      id={`day-${getDateKey(appointmentStartDate)}`}
                      className="font-semibold text-foreground"
                    >
                      {formatDayHeading(appointmentStartDate)}
                    </h4>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Choose a start time for {formatFullDate(appointmentStartDate)}.
                    </p>
                  </div>
                </div>
                {selectedDateIsUnavailable && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    That date is not available. Please choose another date.
                  </p>
                )}

                <div className="mt-8">
                  {selectedDayStartTimes.length > 0 ? (
                    <div
                      className="flex flex-wrap gap-3"
                      aria-labelledby={`day-${getDateKey(appointmentStartDate)}`}
                    >
                      {selectedDayStartTimes.map((startTime) => {
                        const isSelected = selectedStartTime === startTime

                        return (
                          <button
                            key={startTime}
                            type="button"
                            onClick={() => handleStartTimeSelect(startTime)}
                            aria-pressed={Boolean(isSelected)}
                            className={`min-h-10 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                              isSelected
                                ? "bg-accent text-accent-foreground"
                                : "bg-secondary text-accent hover:bg-accent/10"
                            }`}
                          >
                            {formatTimeLabel(startTime)}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No start times fit the selected duration on this day.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                <div className="mb-2 flex items-center gap-3">
                  <Timer className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Choose duration
                  </h3>
                </div>
                <p className="mb-6 text-sm leading-6 text-muted-foreground">
                  Pick the closest package. The start-time list will only show slots
                  that fit before the end of the booking day.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {sessionPackages.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => handleDurationSelect(session)}
                      className={`relative rounded-xl border p-4 text-left transition-all ${
                        selectedDuration === session.id
                          ? "border-accent bg-accent/10 ring-1 ring-accent"
                          : "border-border bg-secondary hover:border-accent/50"
                      }`}
                    >
                      <div className="mb-1 text-2xl font-bold text-accent">
                        {formatPrice(session.fullPriceInCents)}
                      </div>
                      <div className="mb-1 text-sm font-semibold text-foreground">
                        {session.label}
                      </div>
                      <div className="mb-2 text-xs text-muted-foreground">
                        {session.duration}
                      </div>
                      <p className="text-xs leading-5 text-muted-foreground">
                        {session.description}
                      </p>
                      {selectedDuration === session.id && (
                        <div className="absolute right-2 top-2">
                          <CheckCircle2 className="h-5 w-5 text-accent" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs italic text-muted-foreground">
                  * Prices are estimates. Final quote provided after consultation
                  based on specific requirements.
                </p>
              </div>

              {(selectedStartTime || selectedSession) && (
                <div
                  role="status"
                  className="rounded-xl border border-accent/30 bg-accent/10 p-5"
                >
                  {selectedStartTime && selectedSession && selectedAppointmentDescription ? (
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-background p-3">
                        <Clock className="h-5 w-5 text-accent" />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {selectedAppointmentDescription.title}
                          </h4>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {selectedAppointmentDescription.body}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="rounded-md bg-background px-3 py-1.5 text-foreground">
                            Starts {formatTimeLabel(selectedStartTime)}
                          </span>
                          <span className="rounded-md bg-background px-3 py-1.5 text-foreground">
                            Estimated finish{" "}
                            {formatTimeLabel(selectedAppointmentDescription.finishTime)}
                          </span>
                          <span className="rounded-md bg-background px-3 py-1.5 text-foreground">
                            {selectedSession.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-6 text-muted-foreground">
                      Choose both a start time and duration to see what that booking
                      window is best suited for.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedDate || !selectedStartTime || !selectedDuration}
                  className="w-full max-w-sm bg-accent px-8 py-6 text-base text-accent-foreground hover:bg-accent/90 sm:text-lg"
                >
                  Continue to Details
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleProceedToPayment} className="mx-auto max-w-2xl">
              <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                <div className="mb-8 rounded-lg bg-secondary p-5">
                  <p className="mb-3 text-sm text-muted-foreground">
                    Your Booking Summary
                  </p>
                  <div className="space-y-3">
                    <p className="font-medium text-foreground">
                      {formatFullDate(selectedDate)}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-background px-3 py-1.5">
                        <Clock className="h-4 w-4 text-accent" />
                        <span className="text-foreground">
                          {selectedStartTime ? formatTimeLabel(selectedStartTime) : ""}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-background px-3 py-1.5">
                        <Timer className="h-4 w-4 text-accent" />
                        <span className="text-foreground">
                          {selectedSession?.label} ({selectedSession?.duration})
                        </span>
                      </span>
                    </div>
                    {selectedAppointmentDescription && (
                      <p className="text-sm leading-6 text-muted-foreground">
                        {selectedAppointmentDescription.title}:{" "}
                        {selectedAppointmentDescription.body}
                      </p>
                    )}
                    <p className="mt-3 text-lg font-semibold text-accent">
                      Estimated:{" "}
                      {selectedSession ? formatPrice(selectedSession.fullPriceInCents) : ""}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="service" className="text-foreground">
                      Service Type <span className="text-accent">*</span>
                    </Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, serviceType: value })
                      }
                      required
                    >
                      <SelectTrigger className="mt-2 border-border bg-input text-foreground">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            {service.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name" className="text-foreground">
                        Full Name <span className="text-accent">*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(event) =>
                          setFormData({ ...formData, name: event.target.value })
                        }
                        required
                        className="mt-2 border-border bg-input text-foreground"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-foreground">
                        Email Address <span className="text-accent">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(event) =>
                          setFormData({ ...formData, email: event.target.value })
                        }
                        required
                        className="mt-2 border-border bg-input text-foreground"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="phone" className="text-foreground">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(event) =>
                          setFormData({ ...formData, phone: event.target.value })
                        }
                        className="mt-2 border-border bg-input text-foreground"
                        placeholder="+61 493 316 602"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-foreground">
                      Tell Us About Your Project
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.projectDescription}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          projectDescription: event.target.value,
                        })
                      }
                      className="mt-2 min-h-[120px] border-border bg-input text-foreground"
                      placeholder="Describe your vision, goals, and any specific requirements..."
                    />
                  </div>
                </div>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={!formData.name || !formData.email || !formData.serviceType}
                    className="bg-accent px-8 py-6 text-base text-accent-foreground hover:bg-accent/90 sm:text-lg"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Continue to Deposit Options
                  </Button>
                </div>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="w-full">
              {bookingError && (
                <div
                  role="alert"
                  className="mx-auto mb-6 flex max-w-4xl items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  <p>{bookingError}</p>
                </div>
              )}
              {isSubmitting && (
                <div
                  role="status"
                  className="mx-auto mb-6 max-w-4xl rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm text-foreground"
                >
                  Saving your booking request...
                </div>
              )}
              <DepositPayment
                sessionId={selectedDuration}
                bookingReference={bookingReference}
                customerEmail={formData.email}
                customerName={formData.name}
                depositAmount={selectedSession?.depositPriceInCents || 0}
                fullAmount={selectedSession?.fullPriceInCents || 0}
                onPaymentComplete={handlePaymentComplete}
                onBack={() => setStep(2)}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
