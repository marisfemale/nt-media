# Staging Tester Guide

## Test Site

Use the staging site only:

```text
http://148.230.101.181:3011
```

Admin login:

```text
http://148.230.101.181:3011/admin-login
```

This is a test environment. It uses a separate database from production, so test bookings, test galleries, and deleted test data should not affect the live website.

## What To Test

Open `docs/staging-test-cases.csv` in Excel or Google Sheets and update the `Status`, `Actual Result`, `Bug ID/Link`, `Device/Browser`, and `Notes` columns.

Suggested statuses:

```text
Not Run
Pass
Fail
Blocked
Needs Review
```

## Stripe Test Card

Use test card details only:

```text
Card: 4242 4242 4242 4242
Expiry: any future date
CVC: any 3 digits
ZIP/postcode: any valid value
```

Do not use a real card on staging.

## Fast Bug Report Format

For each issue, send this:

```text
Title:
Page/URL:
What I clicked or entered:
What I expected:
What happened:
Device/browser:
Screenshot or video:
Severity: Critical / High / Medium / Low
Can you repeat it? Yes / No
```

## Severity Guide

Critical: site unusable, payment broken, booking impossible, admin cannot log in, data loss.

High: important flow broken, gallery inaccessible, upload fails, wrong customer-facing information.

Medium: confusing behavior, validation issue, layout problem that affects use.

Low: typo, small spacing issue, minor visual polish.

## Faster Than Excel

Best simple option: use GitHub Issues for bug reports, with the title starting with `[STAGING]`.

Example issue title:

```text
[STAGING] Booking form accepts invalid phone number
```

If GitHub is too much for the tester, use a shared Google Form with the same fields as the bug report format. The form responses can feed into a Google Sheet automatically, which is faster than opening and editing Excel manually.
