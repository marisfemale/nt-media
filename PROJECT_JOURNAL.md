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

## 2026-07-15 — Confirm local email warning cause

### Verified cause

- The booking-success warning is behaving as designed: the booking saved, but the customer email was not accepted for delivery.
- Local `.env.local` contains a `RESEND_API_KEY` entry, but it is still the documented placeholder rather than a usable `re_...` key.
- Local `BOOKING_EMAIL_FROM` is also still the `example.com` placeholder rather than an address on a Resend-verified domain.
- The local development server is running, so it must be restarted after real Resend configuration is added.
- No environment values were printed, copied, or recorded.

### Files changed

- `PROJECT_JOURNAL.md` only (diagnostic record).

### Required next step

- Configure a real Resend API key and verified sender locally and independently on staging, restart each application, then test and check the Resend delivery log. The previously exposed Stripe test secret still requires rotation.

## 2026-07-15 — Add customer booking confirmation email

### Goal and verified cause

- Investigated a successful booking that did not send a customer confirmation.
- The application previously called `notifyAdminOfBooking`, which sent only to the configured admin address; no customer email was implemented.
- Staging had previously been verified to contain only `DATABASE_URL`, so Resend configuration must also be added there before any application email can be accepted for delivery.
- A Stripe test secret was exposed in conversation context. Its value was not copied into code, tools, logs, or this journal; it must be rotated immediately and replaced in every environment where it was used.

### Completed

- Replaced the admin-only email function with `notifyBookingParties`, which independently sends an admin notification and a customer email through Resend.
- Customer card bookings receive a confirmed/deposit-received message; bank-transfer bookings receive a pending booking-request message.
- Email-provider failures remain non-blocking and cannot undo a saved booking.
- The booking API now reports whether the customer email was accepted by Resend.
- The success UI no longer falsely guarantees an email was sent: it shows accepted-for-delivery wording or a warning to retain the booking reference.
- Extended `Test resource.md` with customer/admin email and failure-copy checks.

### Files changed

- `lib/booking-email.ts`
- `app/api/bookings/route.ts`
- `components/booking-section.tsx`
- `Test resource.md`
- `PROJECT_JOURNAL.md`

### Verification

- `npx tsc --noEmit --incremental false` passed.
- Targeted ESLint passed for all changed implementation files.
- `npm run build` passed using temporary placeholder Stripe values; the exposed key was not used for verification.

### Required next steps

- Rotate the exposed Stripe test secret in Stripe, then update local and staging configuration without sharing values.
- Configure staging `RESEND_API_KEY` and `BOOKING_EMAIL_FROM`. For real recipient delivery, the From domain must be verified in Resend; Resend's designated test addresses can validate provider events without delivering to a person's inbox.
- Commit/push/deploy this change, restart only `nt-media-staging`, and test both successful card and pending bank email paths.

## 2026-07-15 — Staging checkout clean; Stripe configuration missing

### Verified facts

- `/var/www/nt-media-staging` is the correct staging checkout, on clean branch `main`, currently at `ea83a07`.
- Fetch updated staging's `origin/main` to `857fdcf`; six commits are ready to fast-forward, including the card-details flow, payment hardening, QA resources, calendar hydration fix, and README.
- Staging is healthy before deployment with HTTP 200 on localhost port 3011.
- Staging `.env.local` exists but defines only `DATABASE_URL`; the new Stripe code requires sandbox `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` before build/restart.
- The release from `ea83a07` to `857fdcf` changes neither `package.json`/`package-lock.json` nor `prisma/schema.prisma`, so no dependency-version or database-schema change is part of this deployment.

### Decision

- Configure Stripe test keys and a strong admin session secret in staging without printing values, change `.env.local` permissions to owner-only, then fast-forward/build/restart only PM2 `nt-media-staging`. Do not touch production `/root/nt-media` or PM2 `nt-media`.

### Files changed

- `PROJECT_JOURNAL.md` only (staging readiness record).

## 2026-07-15 — Production and staging directories confirmed separate

### Verified runtime layout

- PM2 `nt-media` runs from `/root/nt-media` with `npm run start -p 3010`; this is the production checkout.
- PM2 `nt-media-staging` runs from `/var/www/nt-media-staging` with `npm start -p 3011`; this is the staging/test checkout.
- Staging remains healthy on port 3011.
- The dirty tracked images, modified lockfile, and untracked `top all` file belong to `/root/nt-media` production and must not be changed during the staging deployment.
- The production checkout is six commits behind fetched `origin/main`, whose current tip is `857fdcf`.
- The inspected production `.env` and `.env.local` expose only the `DATABASE_URL` variable name; no values were displayed.

### Decision

- Leave `/root/nt-media` untouched. All further staging inspection and deployment work must occur only in `/var/www/nt-media-staging` and only restart the `nt-media-staging` PM2 process.

### Files changed

- `PROJECT_JOURNAL.md` only (verified VPS topology record).

### Required next step

- Inspect the staging checkout's Git status/current commit, remote, environment filenames and variable names, dependencies, and database configuration without revealing values. If clean and correctly isolated, back it up, fast-forward to `origin/main`, install/build/apply schema, and restart only `nt-media-staging`.

## 2026-07-15 — VPS diagnostic interrupted by Git pager

### Verified facts

- VPS `git fetch origin` succeeded and updated its remote-tracking `main` from `ea83a07` to `857fdcf`.
- Current GitHub/local `main` is `857fdcf` (`update readme`), which includes the onboarding README and preceding journal documentation.
- `git diff --stat` entered the `less` pager at `(END)`; commands typed afterward were garbled pager input and did not reliably execute.
- The output therefore does not yet confirm the PM2 working directories, command lines, or metadata for `top all`.

### Decision and next step

- No deployment action has been taken. Exit the pager with `q` and rerun the bounded diagnostics with `GIT_PAGER=cat`/`--no-pager` before backing up or updating the VPS checkout.

### Files changed

- `PROJECT_JOURNAL.md` only (diagnostic status record).

## 2026-07-15 — Staging runtime and deployment blockers confirmed

### Verified facts

- The VPS staging application is `/root/nt-media`, on branch `main`, with remote `https://github.com/marisfemale/nt-media.git`.
- The server checkout is currently at `ea83a07` (`change port from 5432 to 5433 to avoid conflict`), well behind the current GitHub `main` release.
- PM2 processes `nt-media` and `nt-media-staging` are both online; staging listens on port 3011 and returns HTTP 200 locally.
- Both `/root/nt-media/.env` and `/root/nt-media/.env.local` exist. Their contents were not exposed.
- The server working tree is dirty: `package-lock.json`, many tracked public image/icon files, and an untracked file named `top all` differ from Git.

### Deployment risk and decision

- Do not pull, reset, clean, or rebuild yet. Existing server-side asset changes must be preserved and assessed.
- Confirm whether the production and staging PM2 processes share `/root/nt-media` as their working directory. If they do, rebuilding `.next` in place can affect both environments and the deployment layout should be separated before treating staging as isolated.

### Files changed

- `PROJECT_JOURNAL.md` only (verified VPS state record).

### Required next step

- Inspect only the PM2 script paths/cwds, listener ownership, Git diff summary, and metadata for `top all`; then create a server-side backup before choosing a stash/merge or separate staging checkout strategy. Do not display environment values.

## 2026-07-15 — Staging VPS application path identified

### Verified facts

- The staging VPS shell prompt identifies the host as `srv1028159` and the approved SSH user as `root`.
- The NT Media application directory is `/root/nt-media`.
- `/root/.pm2` exists, so PM2 is likely the application process manager; the exact PM2 application name still needs confirmation with `pm2 list`.
- The public staging URL remains `http://148.230.101.181:3011`.
- A root-level `/root/.env.local.save` exists, but its contents and relationship to the running application were not inspected. The application directory must be checked for its own hidden `.env.local` without displaying secret values.

### Files changed

- `PROJECT_JOURNAL.md` only (operations discovery record).

### Required next step

- From `/root/nt-media`, confirm Git state, the presence (not contents) of `.env.local`, the PM2 process name/cwd, the listener on port 3011, and the localhost health response. Do not print PM2 environment variables or environment-file contents.

## 2026-07-15 — VPS application-directory discovery guidance

### Goal and guidance

- Documented safe Linux commands for identifying the NT Media application directory on the staging VPS.
- Recommended inspecting the current directory and common application roots (`/var/www`, `/srv`, `/opt`, and `/home`) before using a bounded `find` for `.git`, `package.json`, or an `nt-media` directory.
- Avoided recommending an unbounded recursive listing of `/`, which can be slow, noisy, and expose unrelated system paths.

### Files changed

- `PROJECT_JOURNAL.md` only (operations guidance record).

### Next step

- User connects through the approved SSH account, runs the bounded discovery commands, and shares only the resulting application path and service/process information—not passwords, keys, environment values, or file contents.

## 2026-07-15 — Replace README with onboarding and operations guide

### Goal and completed work

- Replaced the one-line root README with a newcomer-oriented guide to the application, technology, prerequisites, environment setup, Docker/PostgreSQL, Prisma, local development, admin access, Stripe testing, common commands, content updates, code workflow, staging, production safeguards, project structure, and troubleshooting.
- Documented Node.js 20.9+ from the installed Next.js package's declared engine requirement.
- Clearly separated GitHub pushes from the current manual VPS staging deployment and marked the unknown SSH user, application directory, service manager, backup procedure, and environment location as required operational inputs rather than guessed commands.
- Documented that production gallery uploads require Vercel Blob, email delivery requires Resend, staging uses Stripe test keys, and secrets must never be committed.
- Linked the existing tester resource, staging guide, test cases, QA checklist, and GitHub bug template.

### Files changed

- `README.md`
- `PROJECT_JOURNAL.md`

### Verification

- Confirmed all five local Markdown links in the README resolve to existing repository files.
- Confirmed every documented npm script exists in `package.json`.
- `git diff --check` passed apart from expected LF-to-CRLF working-copy warnings.
- No application checks were rerun because this task changed documentation only; the preceding release entry records passing TypeScript, targeted lint, and production build checks.

### Open item

- When staging access is identified, replace deployment placeholders with the verified SSH username policy, VPS application path, service/process name, restart command, backup procedure, and secret-management location without recording credentials.

## 2026-07-15 — Investigate staging deployment path

### Goal and verified facts

- Determined how the updated `main` branch can reach the testing environment at `http://148.230.101.181:3011`.
- The repository has no GitHub Actions workflows, deployment script/configuration, or staging branch; only `main` exists.
- GitHub has no Actions runs, repository secrets, or repository variables configured for deployment.
- The staging URL is reachable with HTTP 200 and identifies itself as Next.js.
- This computer has an SSH key but no SSH config entry or known-host record for the staging IP, so the server username, application directory, and service manager cannot be safely inferred.

### Files changed

- `PROJECT_JOURNAL.md` only (deployment investigation record).

### Required next step

- Obtain the VPS SSH username, application directory, and restart mechanism (for example PM2, Docker Compose, or systemd). Also ensure Stripe test keys are configured on staging rather than copied through Git. With those details, update via a fast-forward pull, install/build/schema steps appropriate to the server, restart the service, and perform a health check.

## 2026-07-15 — Issue #3 closure verified

### Verified outcome

- Committed the verified card-payment release as `164b280` (`Harden secure card payment flow`) with `Fixes #3`.
- Pushed `main` to `origin/main` successfully.
- GitHub issue #3, `Need add card payment detail`, is confirmed closed.
- The worktree was clean and local `main` matched `origin/main` immediately after the release push.

### Remaining next step

- Deploy the updated `main` branch and have the tester run `Test resource.md` against staging; restart local development with `npm run dev` if needed.

### Files changed

- `PROJECT_JOURNAL.md` only (verified release outcome).

## 2026-07-15 — Ship card-payment issue #3

### Goal and completed work

- Prepared the secure card-details flow, payment/booking failure hardening, calendar hydration fix, corrected local database example, and tester resource for commit to `main`.
- Confirmed `.env.local` is ignored and no Stripe keys or other local secrets are included in the tracked change set.
- Stopped the interactive development server on port 3000 before the production build.

### Verification

- `npx tsc --noEmit --incremental false` passed.
- Targeted ESLint passed with no errors and the same three existing card-logo `<img>` warnings.
- `npm run build` passed using `.env.local`; all routes compiled and page generation completed.
- Issue-closing commit is intended to include `Fixes #3`; staging confirmation is still required after deployment.

### Files included

- `.env.example`
- `components/booking-section.tsx`
- `components/deposit-payment.tsx`
- `components/ui/calendar.tsx`
- `Test resource.md`
- `PROJECT_JOURNAL.md`

### Next step

- Confirm the push closes GitHub issue #3, deploy `main`, restart local development if needed, and have the tester execute `Test resource.md` against staging.

## 2026-07-15 — Refresh GitHub issue audit

### Goal and verified status

- Refreshed the repository's open GitHub issues through the authenticated GitHub CLI.
- Open issues remain: #3 `Need add card payment detail`, #2 `TC-028 Browser compatibility`, and #1 staging QA checklist.
- Issue #3 is addressed by the current local card-details implementation and subsequent payment reliability fixes, but those changes remain uncommitted and unpushed; the reported website cannot reflect them yet.
- Issue #1 still shows both Stripe success and failed-payment cases unchecked.
- Issue #2 has no body or acceptance details.

### Files changed

- `PROJECT_JOURNAL.md` only (issue audit record).

### Recommended next step

- Commit and push the current verified changes, deploy them to staging, have the tester complete the payment matrix, then comment on/close issue #3 only after staging confirmation.

## 2026-07-15 — Add reusable tester resource

### Goal and completed work

- Created `Test resource.md` as a reusable handoff for the tester.
- Included the verified Stripe success, decline, insufficient-funds, and 3DS test cards; common field values; expected outcomes; both payment interfaces; result-recording guidance; and safety rules.
- No API keys, credentials, or other secrets were added.

### Files changed

- `Test resource.md`
- `PROJECT_JOURNAL.md`

### Verification

- Test-card values match the Stripe official testing documentation recorded in the previous journal entry.
- Markdown content was reviewed for secret-handling and tester clarity.

## 2026-07-15 — Stripe tester card matrix confirmed

### Goal and verified guidance

- Verified current interactive test-card values using Stripe's official testing documentation.
- Recommended tester matrix: successful Visa (`4242 4242 4242 4242`), generic decline (`4000 0000 0000 0002`), insufficient funds (`4000 0000 0000 9995`), and successful required 3DS (`4000 0000 0000 3220`).
- Interactive tests use any future expiry, any three-digit CVC, and arbitrary remaining form values.
- Test cards must only be used with Stripe test/sandbox keys; no real card details should be used for testing.

### Files changed

- `PROJECT_JOURNAL.md` only (tester handoff record).

### Next step

- Tester exercises both direct card entry and embedded Checkout, confirms successful bookings appear in the app and Stripe test Dashboard, and records the displayed error for decline scenarios.

## 2026-07-15 — Document Stripe test-key setup

### Goal and verified guidance

- Verified the current Stripe test-key workflow against Stripe's official API-key documentation.
- Test keys are obtained in Stripe Dashboard under Developers → API keys with test/sandbox mode enabled.
- The local app requires `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_...`) and server-only `STRIPE_SECRET_KEY` (`sk_test_...`) in ignored `.env.local`.
- No key values were viewed, stored in tracked files, or shared in chat.

### Files changed

- `PROJECT_JOURNAL.md` only (setup guidance record).

### Next step

- User obtains and inserts both test keys locally, restarts Next.js, and then runs the test-payment matrix before any live-mode configuration.

## 2026-07-15 — Audit Stripe test readiness

### Goal and verified status

- Checked whether the direct-card flow can be claimed as operational without exposing any credentials.
- `.env.local` still contains placeholder values rather than usable Stripe test-mode publishable and secret keys.
- Stripe CLI is not installed.
- Therefore compilation and error-handling verification are complete, but no real Stripe test transaction has been performed and payment operation is not yet proven.

### Files changed

- `PROJECT_JOURNAL.md` only (status record).

### Required next step

- Add Stripe test-mode `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` to `.env.local`, restart Next.js, and run the staging payment matrix. Never commit or paste the keys into chat.

## 2026-07-15 — Fix calendar hydration mismatch

### Goal

Eliminate the React hydration warning caused by different server and browser calendar date attributes.

### Completed and decision

- Replaced `day.date.toLocaleDateString()` in `CalendarDayButton` with a locale-independent `YYYY-MM-DD` formatter built from local calendar date parts.
- Avoided `toISOString()` so the displayed calendar day cannot shift when converted through UTC.

### Files changed

- `components/ui/calendar.tsx`
- `PROJECT_JOURNAL.md`

### Verification

- `npx tsc --noEmit --incremental false` passed.
- `npx eslint components/ui/calendar.tsx` passed with no warnings or errors.
- The active development homepage returned HTTP 200 on port 3000.
- Rendered HTML now uses deterministic values such as `data-day="2026-06-28"`.
- `git diff --check` passed apart from expected LF-to-CRLF working-copy warnings.

## 2026-07-15 — Diagnose calendar hydration warning

### Goal and verified cause

- Reviewed the captured React hydration warning without changing implementation.
- `components/ui/calendar.tsx` sets `data-day` with `day.date.toLocaleDateString()`.
- Server rendering formats July 1 as `7/1/2026`, while the Australian browser formats it as `01/07/2026`; the locale-dependent attribute therefore differs during hydration.
- This warning is unrelated to Prisma and Stripe and does not currently prevent the page from loading.

### Recommended fix

- Replace the locale-dependent `data-day` value with a deterministic year-month-day formatter shared by server and client, then rerun type-check, lint, build, and a browser console check.

### Files changed

- `PROJECT_JOURNAL.md` only (diagnosis record).

### Local server handoff

- Stopped the temporary background Next.js verification server (PID 37072) after it conflicted with the user's interactive dev server.
- Confirmed port 3000 is free for the next `npm run dev` invocation.

## 2026-07-15 — Clear stale Turbopack environment cache

### Goal

Resolve the continuing Prisma `Environment variable not found: DATABASE_URL` error after `.env.local` was added.

### Verified cause and completed work

- Next's environment loader independently confirmed that `.env.local` sets `DATABASE_URL`.
- The running development output was stale Turbopack/Prisma output created before the variable existed.
- Stopped only the process listening on port 3000, safely removed the generated workspace `.next` directory, and started a fresh hidden development server.

### Verification

- Fresh Next.js startup reported `.env.local` loaded.
- `GET /` returned HTTP 200 with the Prisma portfolio query executing successfully.
- `GET /api/blocked-dates` also returned HTTP 200.
- No Prisma initialization error appears in the fresh server log.

### Open item

- A separate non-blocking calendar hydration warning remains: `data-day` formats differ between server (`DD/MM/YYYY`) and client (`M/D/YYYY`). This was not caused by the database or Stripe work and should be handled as a focused follow-up.

### Files changed

- `PROJECT_JOURNAL.md` only; `.next` was regenerated build output.

## 2026-07-15 — Restore local database for portfolio query

### Goal

Diagnose and resolve the development error at `prisma.gallery.findMany` in `listPortfolioItems`.

### Verified cause

- The checkout had no `.env.local`, so Prisma had no local `DATABASE_URL`.
- Docker Desktop was stopped and the project PostgreSQL container did not exist locally.
- `docker-compose.yml` exposes PostgreSQL on host port `5433`, but `.env.example` still documented port `5432`.

### Completed

- Created an ignored `.env.local` with the correct local database URL on port `5433` and safe placeholder values for external services. No real credentials were added.
- Corrected the tracked `.env.example` database port from `5432` to `5433`.
- Started Docker Desktop and the `nt-media-postgres` container.
- Applied the checked-in Prisma schema with `npm run db:push`.

### Files changed

- `.env.example`
- `.env.local` (ignored local configuration)
- `PROJECT_JOURNAL.md`

### Verification

- `docker compose ps` showed PostgreSQL running at `localhost:5433`.
- `npm run db:push` reported the database is in sync with the Prisma schema.
- The equivalent portfolio gallery query completed successfully and returned zero rows on the fresh database.

### Open items and recommended next step

- Restart the running Next.js development server so it reloads `.env.local`.
- Replace local Stripe placeholders with Stripe test-mode keys before payment testing; do not commit or share them in chat.
- The fresh local database contains no portfolio galleries or other prior data.

## 2026-07-15 — Harden Stripe payment and booking-save failures

### Goal

Prevent rejected Stripe/server promises and booking-save failures from leaving the deposit UI stuck or encouraging a customer to pay twice.

### Completed

- Wrapped direct-card confirmation, server verification, and booking completion in a `try`/`catch`/`finally` boundary so processing state is always cleared.
- Changed the payment completion callback to report whether the booking was saved.
- Direct-card customers whose payment succeeded but booking save failed now see a clear instruction to contact NT Media with their reference and not pay again.
- Bank confirmation is only hidden after its booking request is successfully saved.
- Embedded Checkout now awaits the booking completion callback.
- Installed lockfile-pinned dependencies and generated the Prisma client for local verification; neither operation changed tracked dependency files.

### Files changed

- `components/deposit-payment.tsx`
- `components/booking-section.tsx`
- `PROJECT_JOURNAL.md`

### Verification

- `npx tsc --noEmit --incremental false` passed after Prisma client generation.
- Targeted ESLint passed with the same three existing `<img>` warnings in `components/deposit-payment.tsx`.
- `npm run build` passed using a temporary, non-secret test-shaped Stripe key for build-time module initialization; network access was required for configured Google Fonts.
- `git diff --check` passed apart from expected LF-to-CRLF working-copy warnings.
- No automated test runner exists in `package.json`, so live Stripe behavior still requires staging verification.

### Open items and recommended next step

- Configure real Stripe test-mode publishable and secret keys in staging, then deploy these uncommitted changes.
- Tester should cover successful direct card, declined card, 3DS/authentication, embedded Checkout, bank request, and the charged-but-booking-save-failed recovery path.
- Three moderate npm dependency advisories were reported by `npm ci`; no forced/breaking dependency upgrade was attempted in this focused fix.

## 2026-07-15 — Continuation state verified

### Goal

Determine where the previous session stopped and what is needed to continue.

### Verified facts

- `main` is clean and matches `origin/main`.
- Current HEAD is `27d1171` (`Add payby card session.`).
- That commit contains the previously journaled Stripe card-details booking flow plus the project-journal setup.
- The last recorded verification remains: TypeScript passed, targeted ESLint passed with three existing image warnings, and `git diff --check` passed apart from line-ending warnings.

### Open items and recommended next step

- Review and harden error handling so rejected Stripe confirmation or verification promises cannot leave the form stuck processing.
- Run a production build.
- Exercise the staging Stripe matrix: success, decline, 3DS/authentication, server verification failure, and booking-save failure after charge.
- Decide whether the embedded checkout option should continue to be labelled `Apple Pay` when it also accepts ordinary cards.

### Files changed

- `PROJECT_JOURNAL.md` only (handoff record; no implementation changes).

### Verification

- `git log -8 --oneline --decorate` confirmed commit history and HEAD.
- `git status --porcelain=v1` returned no changes before this journal update.
- No build or automated checks were rerun during this status-only task.

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
