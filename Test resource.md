# Test Resource

## Stripe payment testing

Use these card details only when the website is configured with Stripe test/sandbox keys (`pk_test_...` and `sk_test_...`). Never use real card details for testing.

### Common card details

- Expiry: any future date, such as `12/34`
- CVC: any three digits, such as `123`
- Name, postcode, and other fields: any valid test values

### Test cards

| Scenario | Card number | Expected result |
| --- | --- | --- |
| Successful Visa payment | `4242 4242 4242 4242` | Payment succeeds and the booking is confirmed. |
| Generic decline | `4000 0000 0000 0002` | The card is declined and the customer can try again. |
| Insufficient funds | `4000 0000 0000 9995` | An insufficient-funds error is displayed. |
| Required 3D Secure | `4000 0000 0000 3220` | An authentication window appears; complete it to approve the payment. |

## Tester checklist

Test both payment interfaces:

- Pay by card (secure form)
- Embedded Checkout / Apple Pay option

For each scenario, record:

- Payment interface used
- Card scenario
- Whether the displayed result matched the expected result
- Booking reference
- Whether a successful booking appeared in the NT Media admin area
- Whether a successful payment appeared in the Stripe test Dashboard
- Exact error message and screenshot if anything failed

Also verify:

- A declined payment does not create a confirmed booking.
- The payment button does not remain stuck on `Processing card...` after an error.
- A 3D Secure payment returns to the booking flow after authentication.
- Bank transfer saves a `pending payment` booking without charging a card.
- If payment succeeds but the booking cannot be saved, the customer is told to contact NT Media and not pay again.
- A successful card booking sends the customer a `Booking confirmed` email and sends the admin a `New booking` email.
- A bank-transfer booking sends the customer a `Booking request received` email rather than claiming payment is confirmed.
- If the email provider does not accept the customer email, the success page says the booking was saved but the email could not be sent; it must not falsely say the email was sent.
- Check the Resend email log and the recipient's spam/junk folder when diagnosing delivery.

## Safety

- Confirm Stripe is in test/sandbox mode before entering a test card.
- Do not use real card details.
- Do not place API keys in this file, screenshots, issue reports, or chat messages.
- Do not commit `.env.local`.

Full official reference: [Stripe test cards](https://docs.stripe.com/testing)
