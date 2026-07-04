# Spec: Admin, Booking, and Portfolio Controls

## Objective
Add practical controls for the site owner:
- Fix gallery creation feedback and keep gallery admin actions behind an admin password.
- Let customers pick one booking day and see only that day's start times.
- Notify the configured admin email when bookings are created.
- Let admins download calendar files for accepted bookings when the setting is enabled.
- Drive the home page Selected Work section from galleries and their chosen cover images.

## Tech Stack
Next.js App Router, React, Prisma, PostgreSQL, Tailwind CSS, shadcn-style UI components.

## Commands
- Type check: `npx.cmd tsc --noEmit`
- Lint: `npm.cmd run lint`
- Build: `npm.cmd run build`
- Push schema: `npm.cmd run db:push`
- Generate Prisma client: `npm.cmd run db:generate`

## Project Structure
- `app/admin/**`: admin pages, protected by the admin layout.
- `app/api/admin/**`: admin API routes, protected by request cookie validation.
- `components/booking-section.tsx`: customer booking UI.
- `components/portfolio-section.tsx`: customer Selected Work UI.
- `lib/admin-auth.ts`: admin password/session helpers.
- `lib/app-settings.ts`: persisted settings.
- `lib/booking-calendar.ts`: `.ics` calendar export generation.
- `lib/booking-email.ts`: booking notification email helper.
- `lib/portfolio.ts`: public portfolio gallery query.

## Code Style
Use small server-side helpers for shared policy:
```ts
const authorized = await requireAdminRequest(request)
if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
```

## Testing Strategy
Use TypeScript, lint, build, and focused API smoke tests. There is no formal unit test runner configured in this project.

## Boundaries
- Always: validate inputs at API boundaries, hash passwords, use httpOnly cookies, protect admin APIs.
- Ask first: OAuth calendar integrations, new paid email providers, role-based user accounts.
- Never: store plaintext passwords, expose admin APIs without cookie checks, commit real email/API secrets.

## Success Criteria
- `/admin` redirects unauthenticated visitors to `/admin-login`; default password is `0000`.
- Admin can change password, admin notification email, and calendar export setting.
- Booking date picker only renders start times for the selected day.
- Booking API saves start time/duration and attempts notification to configured admin email.
- Admin bookings page exposes calendar export links for accepted bookings when enabled.
- Admin can mark galleries for Selected Work, set category/CTA/sort order, and the home page renders those galleries using cover images.
- Gallery creation returns specific validation/duplicate errors and the UI displays them.

## Open Questions
- True automatic insertion into Google/Microsoft calendars requires OAuth and is intentionally left as a future integration.
