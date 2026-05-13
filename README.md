 # Nexus — TPO Management Portal

>A comprehensive Training & Placement Office (TPO) management platform built with Next.js, TypeScript, Prisma and PostgreSQL.

---

## Table of contents

- Project overview
- Key features
- Tech stack
- Repository layout
- Getting started (local setup)
- Database, migrations & seeds
- Development scripts
- API surface and routes
- Authentication & RBAC
- Mailing & Gmail integration
- Deployment
- Contributing & next steps
- Useful files and references

---

## Project overview

Nexus is a centralized platform to manage placement operations, company contacts, recruitment seasons, mail campaigns, drive scheduling, placement records, and an internal blog/knowledge hub. It targets TPO administrators, coordinators, and students and includes fine-grained role-based access control and audit trails.

Core goals:
- Provide a single source of truth for companies and HR contacts
- Track recruitment seasons, drives, and student eligibility
- Manage and approve outbound mail campaigns with templates and attachments
- Maintain audit logs and assignment workflows for coordinators
- Provide a student-facing portal for wishlists, confirmed placements, and schedules

## Key features

- Company & contact master data with import/export
- Recruitment season and company-season cycle tracking
- Drive (JNF/INF) creation with role eligibility rules
- Email templates, approval workflow and queued mail requests
- Gmail inbox sync and thread-to-company mapping
- Blog system with moderation and voting
- Scheduling & interview calendar management
- In-app notifications and admin reports
- RBAC with user-level permission overrides

## Tech stack

- Next.js (App Router) + React + TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS + PostCSS
- Tiptap (rich-text editor) for blogs/templates
- Gmail API + Nodemailer for inbound/outbound mail
- Zod for validation
- Recharts + XLSX for reporting and exports

## Repository layout (high-level)

- `app/` — Next.js application (routes, layouts, pages)
	- Authentication: `app/(auth)/`
	- Portal: `app/(portal)/` (admin/coordinator views)
	- Student portal: `app/student/`
- `components/` — Reusable React components and layout
- `components/ui/` — Small UI primitives (Modal, Badge, RichTextEditor)
- `lib/` — Shared libraries (api helpers, auth, db client, mailing)
- `prisma/` — `schema.prisma` and migrations
- `scripts/` — Seeds, backfills and bootstrapping utilities
- `services/` — Business logic services (example: scheduleService)
- `public/uploads/` — File uploads (mail attachments)

See the detailed report at [API_SPEC.md](API_SPEC.md) and schema at [prisma/schema.prisma].

## Getting started (local development)

Prerequisites:

- Node.js (recommended 18+)
- PostgreSQL (local or remote)
- Yarn or npm

Environment variables (minimum)

Create an `.env.local` in the project root with at least:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME"
SESSION_SECRET="change-this-in-production"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GMAIL_SERVICE_ACCOUNT_JSON="..." # if using service account
```

Install and generate Prisma client:

```bash
npm install
npm run db:generate
```

Run migrations (dev):

```bash
npm run db:migrate
```

Seed sample data (optional but recommended for local testing):

```bash
npm run db:seed
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 (or the configured port). By default the app expects a `basePath` of `/cdpc-nexus` (see `next.config.ts`). For local development this is usually handled by the dev server automatically.

## Database, migrations & seeds

- Schema: [prisma/schema.prisma](prisma/schema.prisma) — contains models for `User`, `Company`, `CompanyContact`, `RecruitmentSeason`, `Drive`, `MailRequest`, `EmailThreadMapping`, `Blog`, `Schedule`, `Notification`, `AuditLog`, and more.
- Migrations: `prisma/migrations/` — review migration history to understand schema evolution.
- Seeds: `scripts/seed.ts` — deterministic seeding of users, companies, seasons, sample drives and blogs.

Common commands:

```bash
npm run db:generate    # generate prisma client
npm run db:migrate     # apply migrations (dev)
npm run db:push        # push schema (careful)
npm run db:studio      # open prisma studio
npm run db:seed        # run seed script
```

## Development scripts

- `npm run dev` — Next.js dev server
- `npm run build` — Build production artifacts
- `npm run start` — Start production server (after build)
- `npm run lint` — Run ESLint
- `npm run db:*` — Prisma-related commands (see `package.json`)

Maintenance scripts in `scripts/` include `backfill-email-thread-mappings.ts`, `bootstrap-admins.ts` and `update-company-hr-contacts.ts`.

## API surface and routes

Major API routes live under `app/api/v1/`. Examples:

- `POST /api/v1/auth/login` — login
- `POST /api/v1/companies` — create company
- `GET /api/v1/drives` — list drives
- `POST /api/v1/mail/requests` — create mail request

For complete API details see [API_SPEC.md](API_SPEC.md) and the auto-generated route files under `app/api/v1/` (browse the folder for specific endpoints). Key server-side helpers are in `lib/api/`.

## Authentication & RBAC

- Custom HMAC-SHA256-signed JWT sessions via cookie `nexus_session` (see [lib/auth/session-edge.ts](lib/auth/session-edge.ts)).
- Role-based policies and route guards are implemented in [lib/auth/rbac.ts](lib/auth/rbac.ts) and enforced by the edge middleware at [proxy.ts](proxy.ts).
- Primary roles include: `tpo_admin`, `coordinator`, `student`, and `tech_support`. Coordinators have subtypes: `general`, `student_representative`, and `mailing_team`.
- Per-user permission overrides are stored in `UserPermission` model (Prisma) allowing admin-granted special access.

## Mailing & Gmail integration

- Inbound sync: [lib/mailing/gmailInbox.ts](lib/mailing/gmailInbox.ts) — Gmail API sync and mailbox state tracking.
- Outbound sending: [lib/mailing/sendMail.ts](lib/mailing/sendMail.ts) — uses Nodemailer or Gmail service.
- Thread-to-company mapping: `EmailThreadMapping` model and backfill script `scripts/backfill-email-thread-mappings.ts`.
- Mail templates and approval flows are scoped under `app/api/v1/mail/templates` and `app/api/v1/mail/requests`.

## Deployment

Two supported patterns are present in the repo:

1) Vercel / Serverless (recommended for minimal ops)

- `vercel.json` contains a redirect to the configured base path.
- Ensure environment variables are set in the deployment environment (DATABASE_URL, SESSION_SECRET, GOOGLE credentials, etc.)

2) Standalone Node.js deployment (VPS/PM2)

- Next.js is configured with `output: "standalone"` to produce a self-contained server bundle.
- Example (see `deploy.txt` and `MakeFile`):

```bash
npm run build
# copy .next/standalone and .next/static and public/ to server
# start server with: node server.js (or pm2 start server.js --name nexus-app)
```

## Useful files & references

- Project manifest: [package.json](package.json)
- Next config: [next.config.ts](next.config.ts)
- Prisma schema: [prisma/schema.prisma](prisma/schema.prisma)
- RBAC rules: [lib/auth/rbac.ts](lib/auth/rbac.ts)
- Edge auth proxy: [proxy.ts](proxy.ts)
- API specification: [API_SPEC.md](API_SPEC.md)
- DB docs: [DB_SCHEMA.md](DB_SCHEMA.md)
- Seed script: [scripts/seed.ts](scripts/seed.ts)
