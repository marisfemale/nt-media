# NT Media

NT Media is the website and administration system for NT Media's photography and video services. It includes the public marketing site, appointment booking, Stripe deposit payments, contact inquiries, client galleries, and an authenticated admin area.

## What the application does

- Displays services, portfolio galleries, business information, and contact details.
- Lets customers choose an appointment date, start time, and session package.
- Accepts a 50% deposit through Stripe Embedded Checkout or a secure Stripe card form.
- Supports bank-transfer booking requests that remain pending until payment is confirmed.
- Stores bookings, contact inquiries, availability, packages, settings, galleries, and access requests in PostgreSQL.
- Provides an admin area for bookings, inquiries, availability, packages, galleries, uploads, and business settings.
- Sends booking notifications through Resend when email delivery is configured.
- Uses Vercel Blob for gallery uploads in deployed environments and local files during development.

## Technology

- Next.js 16 App Router and React 19
- TypeScript
- Tailwind CSS and Radix UI components
- Prisma 6 with PostgreSQL 16
- Stripe Checkout, Elements, and Payment Intents
- Vercel Blob for deployed gallery storage
- Resend for booking notification email

## Prerequisites

Install these before starting:

- Git
- Node.js 20.9 or newer
- npm
- Docker Desktop, or another PostgreSQL server you control
- A Stripe account with sandbox/test keys when testing card payments

The repository uses `package-lock.json`; use npm unless the project deliberately changes package managers.

## Quick start

### 1. Clone and install

```powershell
git clone https://github.com/marisfemale/nt-media.git
cd nt-media
npm ci
```

If the repository is already cloned:

```powershell
git checkout main
git pull --ff-only origin main
npm ci
```

### 2. Create the local environment file

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS or Linux:

```bash
cp .env.example .env.local
```

Edit `.env.local` and replace the example values. Never commit this file or paste its secrets into chat, screenshots, issues, or documentation.

### 3. Start PostgreSQL

The included Docker configuration runs PostgreSQL on host port `5433` because port `5432` may already be occupied:

```powershell
docker compose up -d
docker compose ps
```

The expected local URL is:

```text
postgresql://postgres:password@localhost:5433/nt_media?schema=public
```

The database data is stored in the Docker volume `postgres-data` and persists when the container stops. Do not remove the volume unless you intentionally want to erase the local database.

### 4. Generate Prisma and create the schema

```powershell
npm run db:generate
npm run db:push
```

`db:push` synchronises the database with `prisma/schema.prisma`. This project does not currently use committed Prisma migrations, so back up any shared database before applying schema changes outside local development.

Default session packages are inserted automatically when the application first reads them.

### 5. Start development

```powershell
npm run dev
```

Open:

- Website: <http://localhost:3000>
- Admin login: <http://localhost:3000/admin-login>
- Admin dashboard: <http://localhost:3000/admin>
- Client galleries: <http://localhost:3000/gallery>

On a brand-new database, the admin login page shows the first-time password. Sign in and change it immediately under **Admin → Settings**, especially before exposing the environment to another device or the internet.

## Environment variables

| Variable | Purpose | Required? |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection used by Prisma. | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Browser-side Stripe key. Use `pk_test_...` in development and staging. | Yes for card payments |
| `STRIPE_SECRET_KEY` | Server-only Stripe key. Use `sk_test_...` in development and staging. | Yes for server startup/build and card payments |
| `BLOB_READ_WRITE_TOKEN` | Uploads production gallery images to Vercel Blob. | Required for deployed gallery uploads |
| `ADMIN_EMAIL` | Fallback recipient for booking notifications until changed in Admin Settings. | Recommended |
| `ADMIN_SESSION_SECRET` | Signs admin sessions. Use a long random value unique to each environment. | Required for deployed environments |
| `RESEND_API_KEY` | Sends booking notification emails. Notifications are skipped when it is not configured. | Optional locally; required for email delivery |
| `BOOKING_EMAIL_FROM` | Verified sender used by Resend. | Required with Resend |
| `PORT` | Port used by `next start`; staging currently listens on `3011`. | Deployment-specific |

Important rules:

- Publishable and secret Stripe keys must come from the same Stripe environment.
- Never expose `STRIPE_SECRET_KEY`, `ADMIN_SESSION_SECRET`, database credentials, Resend keys, or Blob tokens in browser code.
- Staging must use Stripe test keys. Never use a real card in staging.
- Production secrets belong in the server or hosting platform, not Git.
- Live card payments require HTTPS and a production-readiness review.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the development server with Turbopack. |
| `npm run build` | Create an optimised production build. |
| `npm start` | Run the previously built application. |
| `npm run lint` | Run ESLint across the repository. |
| `npx tsc --noEmit --incremental false` | Run the full TypeScript check. Do this separately because the Next.js configuration currently allows build-time type errors. |
| `npm run db:generate` | Generate Prisma Client using `.env.local`. |
| `npm run db:push` | Apply `prisma/schema.prisma` to the configured database. |
| `npm run db:studio` | Open Prisma Studio for the configured database. |
| `docker compose up -d` | Start local PostgreSQL. |
| `docker compose ps` | Show local database status. |
| `docker compose logs postgres` | Show PostgreSQL logs. |
| `docker compose stop` | Stop PostgreSQL without deleting its data volume. |

## Making website changes

### Content and business settings

Many updates do not require editing code. Use the admin area to manage:

- Admin email and password
- Calendar-export behaviour
- Blocked appointment dates
- Session names, durations, descriptions, prices, deposits, and visibility
- Bookings and contact inquiries
- Galleries, photos, cover images, public visibility, and portfolio ordering

### Code changes

For application, layout, or workflow changes:

1. Start from an up-to-date `main` branch.
2. Make focused changes without editing `.env.local` into Git.
3. Run the verification commands below.
4. Review `git status` and the staged diff.
5. Commit with a clear message. Add `Fixes #<number>` when the commit should close a GitHub issue.
6. Push to GitHub.
7. Deploy the new commit to staging and complete staging QA before production.

Example:

```powershell
git checkout main
git pull --ff-only origin main

# Make and verify changes.

git status --short
git add <changed-files>
git diff --cached --check
git diff --cached
git commit -m "Describe the change" -m "Fixes #123"
git push origin main
```

Pushing to GitHub does **not** currently update staging or production automatically.

## Verification before pushing or deploying

Run:

```powershell
npx tsc --noEmit --incremental false
npm run lint
npm run build
git diff --check
```

There is currently no automated test command in `package.json`. Payment, booking, admin, upload, gallery, email, and browser behaviour therefore need manual staging coverage.

Payment testers should use [Test resource.md](./Test%20resource.md). The broader QA resources are:

- [Staging tester guide](./docs/staging-tester-guide.md)
- [Staging test cases](./docs/staging-test-cases.csv)
- [Staging QA checklist](./docs/staging-qa-checklist-issue.md)
- [GitHub staging bug template](./.github/ISSUE_TEMPLATE/staging-bug.yml)

## Staging environment

Current testing URLs:

- Site: <http://148.230.101.181:3011>
- Admin login: <http://148.230.101.181:3011/admin-login>

Staging is intended to use a separate database and Stripe test keys. Test data must not affect production.

### Current deployment status

Deployment is manual. The repository currently has:

- No GitHub Actions deployment workflow
- No staging branch
- No deploy script
- No stored GitHub deployment secrets or variables

Before anyone deploys, the project owner must provide these operational details through a secure channel:

- VPS SSH username and approved SSH key
- Application directory on the VPS
- Process/service name
- Restart mechanism, such as PM2 or systemd
- Backup procedure
- Location of staging environment variables

Do not guess these values and do not place passwords or private keys in this README.

### Manual staging update template

This is the expected sequence after the server details are confirmed. Substitute only verified values:

```bash
ssh <staging-user>@148.230.101.181
cd <staging-application-directory>

git status --short
git fetch origin
git pull --ff-only origin main

npm ci
npm run db:generate
npm run db:push
npm run build

# Use the server's verified process manager, for example:
# pm2 restart <verified-app-name>
# sudo systemctl restart <verified-service-name>
```

Before `db:push`, back up the staging database and confirm `DATABASE_URL` points to staging—not production. After restart:

1. Open the staging home page and admin login.
2. Check the service logs for startup errors.
3. Confirm the deployed commit where the server records it.
4. Run the relevant staging test cases.
5. Test Stripe only with official test cards and test keys.
6. Record failures as GitHub issues using the staging bug template.

If the service runs directly rather than through a process manager, Next.js can listen on the staging port with:

```bash
PORT=3011 npm start
```

Do not use that foreground command as a replacement for the existing service manager until the server setup is documented.

## Production update policy

Do not promote a commit directly from a developer machine without staging verification. A production release should include:

1. A reviewed, clean commit already tested on staging.
2. A database and uploaded-media backup.
3. Production environment validation without displaying secrets.
4. TypeScript, lint, and production-build success.
5. A controlled service restart and health check.
6. Smoke tests for the public site, booking, payment, admin login, and gallery access.
7. A rollback plan to the previous known-good commit.

Production Stripe keys must use `pk_live_...` and `sk_live_...`, remain server-managed, and never be copied into source control. Do not switch from test to live mode until payment web security, HTTPS, business settings, and operational recovery have been reviewed.

## Project structure

```text
app/                 Next.js pages, API routes, server actions, and admin area
components/          Public-site, booking, payment, and reusable UI components
lib/                 Database, Stripe, authentication, email, gallery, and booking logic
prisma/              PostgreSQL schema
public/              Static assets and development-only local uploads
docs/                Staging QA and product documentation
.github/              Issue templates
PROJECT_JOURNAL.md   Durable engineering handoff log
Test resource.md     Reusable Stripe/payment tester guide
```

## Troubleshooting

### `DATABASE_URL` is missing

- Confirm `.env.local` exists in the repository root.
- Confirm `DATABASE_URL` uses local port `5433` when using the included Docker service.
- Restart Next.js after changing environment variables.
- If Turbopack still uses stale values, stop the dev server, remove the generated `.next` directory, and start again.

### Prisma cannot connect

```powershell
docker compose ps
docker compose logs postgres
npm run db:generate
npm run db:push
```

### Port 3000 is already in use

Stop the existing Next.js process instead of starting a second server. On Windows, identify it with:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen
```

### Stripe does not load or payments fail immediately

- Confirm both Stripe keys are test keys from the same sandbox/account.
- Restart Next.js after changing the publishable key because it is exposed to the client build.
- Confirm the selected session package exists and has a valid deposit amount.
- Check the browser console, server output, and Stripe test Dashboard without sharing secret values.

### Production gallery upload fails

Production requires a valid `BLOB_READ_WRITE_TOKEN`. Local development falls back to `public/uploads/gallery`; that directory is ignored by Git and must not be treated as durable deployed storage.

### Staging still shows old code after `git push`

GitHub push and VPS deployment are separate operations. Connect to the staging server, pull the intended commit, rebuild, restart the verified service, and then perform a health check.

## Project memory and contributor guidance

Before beginning repository work, read the newest entry in `PROJECT_JOURNAL.md`. Before finishing, add a dated entry with the goal, verified work, files changed, checks performed, and remaining next step. Repository-specific agent rules are in `AGENTS.md`.
