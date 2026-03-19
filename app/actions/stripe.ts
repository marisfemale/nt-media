"use server"

import { stripe } from "@/lib/stripe"
import { getSessionProduct } from "@/lib/products"

export async function startDepositCheckoutSession(
  sessionId: string,
  bookingReference: string,
  customerEmail: string,
  customerName: string
) {
  const product = getSessionProduct(sessionId)
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

  return session.client_secret
}

export async function getCheckoutSessionStatus(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status: session.status,
    paymentStatus: session.payment_status,
    customerEmail: session.customer_details?.email,
  }
}
