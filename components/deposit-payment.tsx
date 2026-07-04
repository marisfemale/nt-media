"use client"

import { useCallback, useState } from "react"
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { CreditCard, Building2, Copy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { startDepositCheckoutSession } from "@/app/actions/stripe"
import { formatPrice } from "@/lib/products"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface DepositPaymentProps {
  sessionId: string
  bookingReference: string
  customerEmail: string
  customerName: string
  depositAmount: number
  fullAmount: number
  onPaymentComplete: (method: PaymentMethod) => void
  onBack: () => void
}

type PaymentMethod = "card" | "bank"

// NT Media bank details for BPAY/PayID
const BANK_DETAILS = {
  accountName: "NT Media Pty Ltd",
  bsb: "062-000",
  accountNumber: "1234 5678",
  payId: "payments@ntmedia.com.au",
  bpayBillerCode: "12345",
}

export function DepositPayment({
  sessionId,
  bookingReference,
  customerEmail,
  customerName,
  depositAmount,
  fullAmount,
  onPaymentComplete,
  onBack,
}: DepositPaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [bankPaymentConfirmed, setBankPaymentConfirmed] = useState(false)

  const startCheckoutSessionForDeposit = useCallback(
    () =>
      startDepositCheckoutSession(
        sessionId,
        bookingReference,
        customerEmail,
        customerName
      ),
    [sessionId, bookingReference, customerEmail, customerName]
  )

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleBankPaymentConfirmation = () => {
    setBankPaymentConfirmed(true)
    onPaymentComplete("bank")
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Payment Summary */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Payment Summary
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Full Session Price</span>
            <span className="text-foreground">{formatPrice(fullAmount)}</span>
          </div>
          <div className="flex justify-between font-medium text-accent">
            <span>Deposit (50%)</span>
            <span>{formatPrice(depositAmount)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Remaining Balance (due on shoot day)</span>
            <span>{formatPrice(fullAmount - depositAmount)}</span>
          </div>
          <div className="pt-3 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Booking Reference</span>
              <div className="flex items-center gap-2">
                <code className="bg-background px-3 py-1 rounded text-accent font-mono text-sm">
                  {bookingReference}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bookingReference, "reference")}
                  aria-label="Copy booking reference"
                  className="p-1 hover:bg-secondary rounded transition-colors"
                  title="Copy reference"
                >
                  {copied === "reference" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      {!paymentMethod && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground text-center mb-6">
            Choose Payment Method
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card / Apple Pay */}
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className="group p-6 border border-border rounded-xl bg-card hover:border-accent/50 transition-all text-left"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-background group-hover:bg-accent/10 transition-colors">
                  <CreditCard className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    Card / Apple Pay
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Instant confirmation
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Pay securely with credit/debit card or Apple Pay. Your booking
                will be confirmed immediately.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <img
                  src="https://cdn.jsdelivr.net/gh/nicepkg/nice-icons/icons/visa.svg"
                  alt="Visa"
                  className="h-6"
                />
                <img
                  src="https://cdn.jsdelivr.net/gh/nicepkg/nice-icons/icons/mastercard.svg"
                  alt="Mastercard"
                  className="h-6"
                />
                <img
                  src="https://cdn.jsdelivr.net/gh/nicepkg/nice-icons/icons/amex.svg"
                  alt="Amex"
                  className="h-6"
                />
                <span className="text-xs text-muted-foreground ml-2">
                  + Apple Pay
                </span>
              </div>
            </button>

            {/* Bank Transfer / BPAY / PayID */}
            <button
              type="button"
              onClick={() => setPaymentMethod("bank")}
              className="group p-6 border border-border rounded-xl bg-card hover:border-accent/50 transition-all text-left"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-background group-hover:bg-accent/10 transition-colors">
                  <Building2 className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    BPAY / PayID / Bank Transfer
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Submit request now
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Save your booking request and pay the deposit by BPAY, PayID, or
                direct bank transfer. We confirm once payment is received.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <span className="text-xs bg-background px-2 py-1 rounded text-muted-foreground">
                  BPAY
                </span>
                <span className="text-xs bg-background px-2 py-1 rounded text-muted-foreground">
                  PayID
                </span>
                <span className="text-xs bg-background px-2 py-1 rounded text-muted-foreground">
                  Bank Transfer
                </span>
              </div>
            </button>
          </div>

          <div className="flex justify-center mt-6">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-border text-foreground hover:bg-secondary bg-transparent"
            >
              Back to Details
            </Button>
          </div>
        </div>
      )}

      {/* Card Payment - Stripe Embedded Checkout */}
      {paymentMethod === "card" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Pay with Card / Apple Pay
            </h3>
            <button
              type="button"
              onClick={() => setPaymentMethod(null)}
              className="text-sm text-accent hover:underline"
            >
              Change payment method
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{
                fetchClientSecret: startCheckoutSessionForDeposit,
                onComplete: () => onPaymentComplete("card"),
              }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      )}

      {/* Bank Transfer / BPAY / PayID */}
      {paymentMethod === "bank" && !bankPaymentConfirmed && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Bank Payment Details
            </h3>
            <button
              type="button"
              onClick={() => setPaymentMethod(null)}
              className="text-sm text-accent hover:underline"
            >
              Change payment method
            </button>
          </div>

          <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-foreground">
              <strong>Important:</strong> Please use your booking reference{" "}
              <code className="bg-background px-2 py-0.5 rounded font-mono">
                {bookingReference}
              </code>{" "}
              as the payment reference/description. Submit the request below,
              then complete the transfer when you are ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* BPAY */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded">
                  BPAY
                </span>
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Biller Code</p>
                  <div className="flex items-center gap-2">
                    <code className="text-foreground font-mono">
                      {BANK_DETAILS.bpayBillerCode}
                    </code>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(BANK_DETAILS.bpayBillerCode, "biller")
                      }
                      aria-label="Copy BPAY biller code"
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      {copied === "biller" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Reference Number</p>
                  <div className="flex items-center gap-2">
                    <code className="text-accent font-mono font-semibold">
                      {bookingReference}
                    </code>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(bookingReference, "bpay-ref")
                      }
                      aria-label="Copy BPAY reference"
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      {copied === "bpay-ref" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Amount</p>
                  <code className="text-foreground font-mono">
                    {formatPrice(depositAmount)}
                  </code>
                </div>
              </div>
            </div>

            {/* PayID */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded">
                  PayID
                </span>
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">PayID (Email)</p>
                  <div className="flex items-center gap-2">
                    <code className="text-foreground font-mono text-xs">
                      {BANK_DETAILS.payId}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(BANK_DETAILS.payId, "payid")}
                      aria-label="Copy PayID"
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      {copied === "payid" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Description</p>
                  <div className="flex items-center gap-2">
                    <code className="text-accent font-mono font-semibold">
                      {bookingReference}
                    </code>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(bookingReference, "payid-ref")
                      }
                      aria-label="Copy PayID description"
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      {copied === "payid-ref" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Amount</p>
                  <code className="text-foreground font-mono">
                    {formatPrice(depositAmount)}
                  </code>
                </div>
              </div>
            </div>

            {/* Bank Transfer */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded">
                  Bank Transfer
                </span>
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Account Name</p>
                  <code className="text-foreground font-mono text-xs">
                    {BANK_DETAILS.accountName}
                  </code>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">BSB</p>
                  <div className="flex items-center gap-2">
                    <code className="text-foreground font-mono">
                      {BANK_DETAILS.bsb}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(BANK_DETAILS.bsb, "bsb")}
                      aria-label="Copy BSB"
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      {copied === "bsb" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Account Number</p>
                  <div className="flex items-center gap-2">
                    <code className="text-foreground font-mono">
                      {BANK_DETAILS.accountNumber}
                    </code>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          BANK_DETAILS.accountNumber.replace(/\s/g, ""),
                          "acc"
                        )
                      }
                      aria-label="Copy account number"
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      {copied === "acc" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Reference</p>
                  <code className="text-accent font-mono font-semibold">
                    {bookingReference}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-border text-foreground hover:bg-secondary px-6 py-6 bg-transparent"
            >
              Back
            </Button>
            <Button
              onClick={handleBankPaymentConfirmation}
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6"
            >
              Submit Booking Request
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
