# Project Journal

This file is the persistent project handoff for coding sessions. Read the latest entry before starting work and add a new entry before finishing any project task, including investigation-only work.

Keep entries concise but complete. Put the newest entry first, preserve older entries, distinguish verified facts from assumptions, and never include secrets, credentials, tokens, or sensitive customer data.

Each entry should record:

- Date and task goal
- Meaningful work completed
- Files changed
- Decisions and durable context
- Verification commands and outcomes
- Open issues, risks, and the recommended next step

---

## 2026-07-15 — Persistent journal established

### Goal

Create durable project memory so future coding sessions can continue from the current state instead of reconstructing prior work.

### Completed

- Created this root-level project journal.
- Updated `AGENTS.md` to require every coding agent to read the journal at the start of a task and update it before finishing.
- Reviewed and documented the existing uncommitted booking/deposit work without changing its implementation. This snapshot records repository state and does not assert who authored those changes.

### Current repository snapshot

- Branch: `main`
- HEAD when this entry was created: `c7a09be` (`Add staging QA checklist issue template`)
- Pre-existing modified files: `app/actions/stripe.ts`, `app/api/bookings/route.ts`, `components/booking-section.tsx`, `components/deposit-payment.tsx`, and `lib/booking-email.ts`
- The current implementation adds `card_details` as a third payment method alongside embedded Stripe checkout and bank transfer.
- The new card-details path creates an AUD, card-only Stripe PaymentIntent for the package deposit, confirms it through Stripe `CardElement`, and verifies status, metadata, amount, and currency before saving the booking.
- Verified card-details bookings and embedded-checkout bookings are saved as `confirmed`; bank-transfer bookings remain `pending_payment`.
- Booking requests now include `session_id` and may include `payment_intent_id`. These values are used for verification but are not persisted on the Booking row.
- Admin email payment labels replace underscores with spaces, so `card_details` is displayed as `card details`.
- The payment UI now offers three choices: Apple Pay/embedded checkout, secure card details, and bank transfer/PayID, with updated confirmation copy for each path.

### Verification recorded for the existing implementation

- `npx tsc --noEmit --incremental false` passed.
- Targeted ESLint passed for all five modified implementation files. Three existing `<img>` optimization warnings remain in the frontend components.
- `git diff --check` passed apart from Git's LF-to-CRLF working-copy warnings.
- No automated tests cover the new `card_details` flow, and `package.json` has no `test` script.
- A production build and live/manual Stripe payment tests have not been run.

### Open items and risks

- Manually test successful payments, declined cards, 3DS/authentication, server verification failure, and booking-save failure after a successful charge.
- Unexpected promise rejections during Stripe confirmation or server verification may leave the form in its processing state; review error handling before release.
- The embedded checkout option is labelled `Apple Pay`, although its description also allows ordinary credit/debit cards. Confirmation text may therefore identify a regular card payment as Apple Pay.

### Files changed for this journal task

- `AGENTS.md`
- `PROJECT_JOURNAL.md`

### Recommended next step

Review the open card-payment edge cases, add focused automated coverage where practical, then run a production build and complete the staging Stripe test matrix before committing the payment-flow changes.
