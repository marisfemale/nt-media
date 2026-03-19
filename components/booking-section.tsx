"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Loader2,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Timer,
  CreditCard,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { DepositPayment } from "@/components/deposit-payment"
import { getSessionProduct, formatPrice } from "@/lib/products"

const services = [
  { value: "photography", label: "Photography Session" },
  { value: "scripted-video", label: "Scripted Video Production" },
  { value: "unscripted-video", label: "Unscripted Video / Documentary" },
  { value: "post-production", label: "Post-Production Services" },
  { value: "consultation", label: "Free Consultation" },
]

const sessionDurations = [
  {
    value: "30min",
    label: "Quick Session",
    duration: "30 minutes",
    price: "$150",
    description: "Perfect for headshots or single product shots",
  },
  {
    value: "1hr",
    label: "Standard Session",
    duration: "1 hour",
    price: "$275",
    description: "Ideal for portraits, small events, or mini projects",
  },
  {
    value: "2hr",
    label: "Extended Session",
    duration: "2 hours",
    price: "$500",
    description: "Great for lifestyle shoots or multiple setups",
  },
  {
    value: "4hr",
    label: "Half Day",
    duration: "4 hours",
    price: "$950",
    description: "Comprehensive coverage for events or commercial work",
  },
  {
    value: "8hr",
    label: "Full Day",
    duration: "8 hours",
    price: "$1,800",
    description: "Complete production for large projects or full events",
  },
]

const timeOfDayOptions = [
  {
    value: "early-morning",
    label: "Early Morning / Sunrise",
    time: "5:30 AM - 8:00 AM",
    icon: Sunrise,
    vibe: "Soft, ethereal, and pristine",
    bestFor: "Outdoor portraits, peaceful landscapes, and capturing the 'beginning' of a story",
    lighting: "Diffused natural light with cool, crisp tones",
  },
  {
    value: "mid-day",
    label: "Mid-day / High Noon",
    time: "11:00 AM - 2:00 PM",
    icon: Sun,
    vibe: "Bold, vibrant, and energetic",
    bestFor: "Indoor studio sessions, architectural photography, or high-contrast editorial looks",
    lighting: "Direct, powerful sunlight (Outdoor) or controlled, consistent lighting (Indoor)",
  },
  {
    value: "golden-hour",
    label: "Late Afternoon / Sunset",
    time: "4:00 PM - 7:00 PM",
    icon: Sunset,
    vibe: "Warm, romantic, and breathtaking",
    bestFor: "Cinematic portraits, lifestyle sessions, and 'The NT Signature' glow",
    lighting: "Warm, honey-colored rays that flatter skin tones and create natural lens flares",
    recommended: true,
  },
  {
    value: "night",
    label: "Night / Low Light",
    time: "8:00 PM - 11:00 PM",
    icon: Moon,
    vibe: "Mysterious, moody, and urban-cinematic",
    bestFor: "Late-night events, street-style shoots, and neon-lit narratives",
    lighting: "Ambient city lights, artificial flashes, and deep shadows for a high-drama feel",
  },
]



// Generate a unique booking reference
function generateBookingReference(): string {
  const prefix = "NT"
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function BookingSection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedDuration, setSelectedDuration] = useState<string>("")
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>("")
  const [blockedDates, setBlockedDates] = useState<Date[]>([])
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [bookingReference, setBookingReference] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | null>(null)
const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
serviceType: "",
    projectDescription: "",
  })

  const supabase = createClient()

  // Fetch blocked dates
  useEffect(() => {
    async function fetchAvailability() {
      const { data: blocked } = await supabase
        .from("blocked_dates")
        .select("blocked_date")

      if (blocked) {
        setBlockedDates(blocked.map((b) => new Date(b.blocked_date)))
      }
    }

    fetchAvailability()
  }, [supabase])

  // Check if a date is disabled
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Disable past dates
    if (date < today) return true

    // Disable Sundays
    if (date.getDay() === 0) return true

    // Disable blocked dates
    const dateStr = date.toISOString().split("T")[0]
    if (blockedDates.some((d) => d.toISOString().split("T")[0] === dateStr)) {
      return true
    }

    return false
  }

// Generate reference and move to payment step
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedDuration || !selectedTimeOfDay) return
    if (!formData.name || !formData.email || !formData.serviceType) return
    
    // Generate booking reference
    const reference = generateBookingReference()
    setBookingReference(reference)
    setStep(4)
  }

  // Save booking after payment is complete
  const handlePaymentComplete = async () => {
    if (!selectedDate || !selectedDuration || !selectedTimeOfDay) return
    
    setIsSubmitting(true)
    
    const selectedDurationData = sessionDurations.find(s => s.value === selectedDuration)
    const selectedTimeData = timeOfDayOptions.find(t => t.value === selectedTimeOfDay)
    const product = getSessionProduct(selectedDuration)
    
    const { error } = await supabase.from("bookings").insert({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      service_type: formData.serviceType,
      booking_date: selectedDate.toISOString().split("T")[0],
      booking_time: `${selectedTimeData?.label} (${selectedTimeData?.time}) - ${selectedDurationData?.label} (${selectedDurationData?.duration})`,
      project_description: formData.projectDescription || null,
      budget_range: product ? formatPrice(product.fullPriceInCents) : null,
      status: paymentMethod === "card" ? "confirmed" : "pending_payment",
    })
    
    setIsSubmitting(false)
    
    if (error) {
      console.error("Booking error:", error)
      alert("There was an error submitting your booking. Please try again.")
      return
    }
    
    setIsSuccess(true)
  }

if (isSuccess) {
    const selectedDurationData = sessionDurations.find(s => s.value === selectedDuration)
    const selectedTimeData = timeOfDayOptions.find(t => t.value === selectedTimeOfDay)
    const product = getSessionProduct(selectedDuration)
    
    return (
      <section id="booking" className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              {paymentMethod === "card" ? "Booking Confirmed!" : "Booking Request Received!"}
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              Thank you, {formData.name}! {paymentMethod === "card" 
                ? "Your booking has been confirmed." 
                : "Your booking will be confirmed once we receive your payment."}
            </p>
            
            {/* Booking Reference */}
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Your Booking Reference</p>
              <p className="text-2xl font-mono font-bold text-accent">{bookingReference}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Please save this reference for your records
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 mb-6 text-left">
              <div className="space-y-3">
                <p className="text-foreground">
                  <span className="font-medium">Date:</span>{" "}
                  {selectedDate?.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-foreground">
                  <span className="font-medium">Time:</span>{" "}
                  {selectedTimeData?.label} ({selectedTimeData?.time})
                </p>
                <p className="text-foreground">
                  <span className="font-medium">Duration:</span>{" "}
                  {selectedDurationData?.label} ({selectedDurationData?.duration})
                </p>
                <div className="pt-3 border-t border-border mt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Price</span>
                    <span className="text-foreground">{product ? formatPrice(product.fullPriceInCents) : selectedDurationData?.price}</span>
                  </div>
                  <div className="flex justify-between text-accent font-semibold">
                    <span>Deposit Paid (50%)</span>
                    <span>{product ? formatPrice(product.depositPriceInCents) : ""}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Remaining Balance</span>
                    <span>{product ? formatPrice(product.fullPriceInCents - product.depositPriceInCents) : ""}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-8">
              {paymentMethod === "card" 
                ? "A confirmation email has been sent to " 
                : "Once your payment is received, we'll send a confirmation email to "}
              <span className="text-accent">{formData.email}</span>
              {paymentMethod === "bank" && " within 1-2 business days."}
            </p>
            <Button
              onClick={() => {
                setIsSuccess(false)
                setStep(1)
                setSelectedDate(undefined)
                setSelectedDuration("")
                setSelectedTimeOfDay("")
                setBookingReference("")
                setPaymentMethod(null)
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
serviceType: "",
                  projectDescription: "",
                })
              }}
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
    <section id="booking" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
            Book a Session
          </p>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 text-balance">
            Schedule Your Visual Story
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Select a date and time that works for you. We&apos;ll confirm your booking
            within 24 hours.
          </p>
        </div>

{/* Booking Steps Indicator */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-12">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-medium text-sm transition-colors ${
                    step >= s
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-8 md:w-16 lg:w-24 h-0.5 mx-1 md:mx-2 transition-colors ${
                      step > s ? "bg-accent" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 md:gap-12 lg:gap-16 mb-12 text-xs md:text-sm">
            <span className={step >= 1 ? "text-foreground" : "text-muted-foreground"}>
              Select Date
            </span>
            <span className={step >= 2 ? "text-foreground" : "text-muted-foreground"}>
              Choose Time
            </span>
            <span className={step >= 3 ? "text-foreground" : "text-muted-foreground"}>
              Your Details
            </span>
            <span className={step >= 4 ? "text-foreground" : "text-muted-foreground"}>
              Payment
            </span>
          </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Date Selection */}
          {step === 1 && (
            <div className="flex flex-col items-center">
              <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CalendarDays className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Select a Date
                  </h3>
                </div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
                  className="rounded-md"
                />
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedDate}
                className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg"
              >
                Continue to Time Selection
              </Button>
            </div>
          )}

          {/* Step 2: Duration & Time of Day Selection */}
          {step === 2 && (
            <div className="flex flex-col items-center w-full">
              <p className="text-sm text-muted-foreground mb-8">
                Booking for{" "}
                <span className="text-foreground font-medium">
                  {selectedDate?.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>

              {/* Session Duration Selection */}
              <div className="bg-card border border-border rounded-xl p-6 md:p-8 w-full max-w-4xl mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Timer className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Choose Session Duration
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Select how long you need us for your project
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {sessionDurations.map((session) => (
                    <button
                      key={session.value}
                      type="button"
                      onClick={() => setSelectedDuration(session.value)}
                      className={`relative p-4 rounded-xl border text-left transition-all ${
                        selectedDuration === session.value
                          ? "border-accent bg-accent/10 ring-1 ring-accent"
                          : "border-border bg-secondary hover:border-accent/50"
                      }`}
                    >
                      <div className="text-2xl font-bold text-accent mb-1">
                        {session.price}
                      </div>
                      <div className="font-semibold text-foreground text-sm mb-1">
                        {session.label}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {session.duration}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {session.description}
                      </p>
                      {selectedDuration === session.value && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 italic">
                  * Prices are estimates. Final quote provided after consultation based on specific requirements.
                </p>
              </div>

              {/* Time of Day Selection */}
              <div className="bg-card border border-border rounded-xl p-6 md:p-8 w-full max-w-4xl">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Choose Time of Day
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Each time of day creates a unique visual atmosphere
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {timeOfDayOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedTimeOfDay(option.value)}
                      className={`relative p-5 rounded-xl border text-left transition-all ${
                        selectedTimeOfDay === option.value
                          ? "border-accent bg-accent/10 ring-1 ring-accent"
                          : "border-border bg-secondary hover:border-accent/50"
                      }`}
                    >
                      {"recommended" in option && option.recommended && (
                        <span className="absolute top-3 right-3 text-xs uppercase tracking-wider bg-accent text-accent-foreground px-2 py-1 rounded">
                          Recommended
                        </span>
                      )}
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          selectedTimeOfDay === option.value 
                            ? "bg-accent/20" 
                            : "bg-background"
                        }`}>
                          <option.icon className="w-6 h-6 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground mb-1">
                            {option.label}
                          </div>
                          <div className="text-sm text-accent font-medium mb-2">
                            {option.time}
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">
                              <span className="text-foreground font-medium">The Vibe:</span>{" "}
                              {option.vibe}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="text-foreground font-medium">Best for:</span>{" "}
                              {option.bestFor}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="text-foreground font-medium">Lighting:</span>{" "}
                              {option.lighting}
                            </p>
                          </div>
                        </div>
                      </div>
                      {selectedTimeOfDay === option.value && (
                        <div className="absolute bottom-3 right-3">
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary px-6 py-6"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!selectedDuration || !selectedTimeOfDay}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg"
                >
                  Continue to Details
                </Button>
              </div>
            </div>
          )}

{/* Step 3: Contact Details Form */}
          {step === 3 && (
            <form onSubmit={handleProceedToPayment} className="max-w-2xl mx-auto">
              <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                {/* Booking Summary */}
                <div className="bg-secondary rounded-lg p-5 mb-8">
                  <p className="text-sm text-muted-foreground mb-3">
                    Your Booking Summary
                  </p>
                  <div className="space-y-2">
                    <p className="text-foreground font-medium">
                      {selectedDate?.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="inline-flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-md">
                        <Timer className="w-4 h-4 text-accent" />
                        <span className="text-foreground">
                          {sessionDurations.find(s => s.value === selectedDuration)?.label}{" "}
                          ({sessionDurations.find(s => s.value === selectedDuration)?.duration})
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-md">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="text-foreground">
                          {timeOfDayOptions.find(t => t.value === selectedTimeOfDay)?.label}
                        </span>
                      </span>
                    </div>
                    <p className="text-accent font-semibold text-lg mt-3">
                      Estimated: {sessionDurations.find(s => s.value === selectedDuration)?.price}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Service Type */}
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
                        <SelectTrigger className="mt-2 bg-input border-border text-foreground">
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

                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-foreground">
                          Full Name <span className="text-accent">*</span>
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                          className="mt-2 bg-input border-border text-foreground"
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
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                          className="mt-2 bg-input border-border text-foreground"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    {/* Phone & Budget Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-foreground">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="mt-2 bg-input border-border text-foreground"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>

                    </div>

                    {/* Project Description */}
                    <div>
                      <Label htmlFor="description" className="text-foreground">
                        Tell Us About Your Project
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.projectDescription}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            projectDescription: e.target.value,
                          })
                        }
                        className="mt-2 bg-input border-border text-foreground min-h-[120px]"
                        placeholder="Describe your vision, goals, and any specific requirements..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 justify-center">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary px-6 py-6"
                  >
                    Back
                  </Button>
<Button
                      type="submit"
                      disabled={
                        !formData.name ||
                        !formData.email ||
                        !formData.serviceType
                      }
                      className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Proceed to Payment
                    </Button>
                </div>
              </div>
</form>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div className="w-full">
              <DepositPayment
                sessionId={selectedDuration}
                bookingReference={bookingReference}
                customerEmail={formData.email}
                customerName={formData.name}
                depositAmount={getSessionProduct(selectedDuration)?.depositPriceInCents || 0}
                fullAmount={getSessionProduct(selectedDuration)?.fullPriceInCents || 0}
                onPaymentComplete={handlePaymentComplete}
                onBack={() => setStep(3)}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
