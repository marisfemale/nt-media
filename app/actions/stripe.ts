"use server"

import { stripe } from "@/lib/stripe"
import { getSessionPackage } from "@/lib/session-packages"

export async function startDepositCheckoutSession(
  sessionId: string,
  bookingReference: string,
  customerEmail: string,
  customerName: string
) {
  const product = await getSessionPackage(sessionId)
  if (!product) {
    throw new Error(`Session product with id "${sessionId}" not found`)
  }

  // Create Checkout Session for 50% deposit
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "aud",
          product_data: {
            name: `Deposit: ${product.name}`,
            description: `50% deposit for NT Media booking. Reference: ${bookingReference}. Remaining balance due on shoot day.`,
          },
          unit_amount: product.depositPriceInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      booking_reference: bookingReference,
      session_type: sessionId,
      customer_name: customerName,
      deposit_type: "50_percent",
    },
    payment_method_types: ["card"],
  })

  if (!session.client_secret) {
    throw new Error("Stripe did not return a checkout client secret")
  }

  return session.client_secret
}

export async function startCardDetailsPaymentIntent(
  sessionId: string,
  bookingReference: string,
  customerEmail: string,
  customerName: string
) {
  const product = await getSessionPackage(sessionId)
  if (!product) {
    throw new Error(`Session product with id "${sessionId}" not found`)
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.depositPriceInCents,
    currency: "aud",
    payment_method_types: ["card"],
    receipt_email: customerEmail,
    description: `NT Media deposit for ${product.name}. Reference: ${bookingReference}`,
    metadata: {
      booking_reference: bookingReference,
      session_type: sessionId,
      customer_name: customerName,
      deposit_type: "50_percent",
      payment_flow: "card_details",
    },
  })

  if (!paymentIntent.client_secret) {
    throw new Error("Stripe did not return a payment intent client secret")
  }

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  }
}

export async function verifyCardDetailsPayment(
  paymentIntentId: string,
  bookingReference: string,
  sessionId: string
) {
  const product = await getSessionPackage(sessionId)
  if (!product) {
    return {
      success: false,
      status: "missing_product",
    }
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  const matchesBooking =
    paymentIntent.metadata.booking_reference === bookingReference &&
    paymentIntent.metadata.session_type === sessionId
  const matchesAmount =
    paymentIntent.amount === product.depositPriceInCents &&
    paymentIntent.currency === "aud"

  return {
    success:
      paymentIntent.status === "succeeded" &&
      matchesBooking &&
      matchesAmount,
    status: paymentIntent.status,
  }
}

export async function getCheckoutSessionStatus(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status: session.status,
    paymentStatus: session.payment_status,
    customerEmail: session.customer_details?.email,
  }
}
