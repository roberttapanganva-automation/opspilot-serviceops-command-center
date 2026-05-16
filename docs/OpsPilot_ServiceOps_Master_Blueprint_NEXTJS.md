# OpsPilot / ServiceOps Command Center — Next.js SaaS Master Blueprint

## Purpose

This is the master product and architecture blueprint for building **OpsPilot**, also called **ServiceOps Command Center**.

This file replaces earlier mixed React/Vite and Next.js planning. The official implementation direction is now:

```text
Next.js App Router + TypeScript + Tailwind CSS + Supabase + n8n later + Stripe later + OpenAI later
```

Use this file together with:

```text
ServiceOps_Command_Center_DB_Blueprint_NEXTJS.md
ServiceOps_Command_Center_UI_Blueprint_NEXTJS.md
ServiceOps_Command_Center_Codex_SKILL_NEXTJS.md
OpsPilot_Codex_Plugins_and_Skills.md
```

---

# Current Implementation Snapshot

OpsPilot now includes the normal app shell plus an owner-only control area.

- Main app routes: `/dashboard`, `/leads`, `/jobs`, `/tasks`, `/calendar`, `/automations`, `/settings`, and `/pipelines`.
- Owner Console routes: `/owner`, `/owner/team`, `/owner/invitations`, `/owner/branding`, `/owner/modules`, `/owner/pipeline`, `/owner/access-rules`, and `/owner/audit-logs`.
- Normal Settings is personal/account and role-limited. Workspace-wide controls live in Owner Console.
- Personal theme preference is available to authenticated users through `profiles.theme_mode`.
- Workspace branding is owner-managed through `workspace_branding` and can drive app name, logo/icon, primary/accent colors, login copy, and workspace default theme.
- The dashboard Pipeline Overview is a preview only. The full working board is `/pipelines`.
- Pipeline groups and stages are owner-managed; operations users move real lead/job cards through stages where their role permissions allow it.
- Invitations are pending records in `workspace_invitations`. Invite links are copied manually for now; email sending is deferred.
- Member activity uses `profiles.last_seen_at` for Online / Recently active / Offline style states. True realtime presence is deferred.

## Current Role Access Matrix

| Role | Current access |
|---|---|
| owner | Full workspace control, Owner Console, branding, modules, pipeline, roles, invites, audit logs |
| admin | Operational access and role-limited Settings visibility; no Owner Console by default |
| manager | Operational access and limited/read-only member visibility where enabled |
| staff | Operational access only |
| viewer | Read-only where practical |

Owner role is not assignable from normal role dropdowns. Owner transfer is deferred.

## Current Deferred Features

- Real email sending for invitations
- True realtime presence
- Owner transfer
- Workspace deletion
- Stripe billing
- n8n automation bridge
- OpenAI assistant actions
- Production deployment hardening and monitoring

## Current Continuation Roadmap

1. Patch 18B Branding Upload / Workspace Logo Storage
2. Patch 18C Pipeline Board Foundation
3. Patch 19 n8n Automation Bridge
4. Patch 20 OpenAI Assistant Draft Actions
5. Patch 21 Stripe Billing Foundation
6. Patch 22 Production Hardening + Security Review
7. Patch 23 Vercel Deployment Setup
8. Patch 24 Demo Mode / Client Demo Polish
9. Patch 25 Portfolio Case Study + Sales Assets

---

# 1. Product Identity

## Product Name

```text
OpsPilot
```

## Full Project Name

```text
ServiceOps Command Center
```

## Product Type

A premium, multi-tenant, white-label-ready SaaS operations dashboard for service businesses.

## Core Promise

```text
Capture leads, track jobs, automate follow-ups, and see what needs attention today.
```

## Primary Target Market

Start with **service businesses** that depend on follow-up, scheduling, assignments, reminders, and status visibility.

Best first niches:

1. Cleaning companies
2. Short-term rental operators
3. Home service businesses
4. Agencies managing client operations
5. Appointment-based clinics later

## First Sellable Offer

```text
Custom branded operations dashboard + automation system
```

Suggested price target:

```text
$3,500 setup + $350–$750/month maintenance
```

---

# 2. Official Stack Decision

## Use Next.js From the Start

The project should use:

```text
Next.js App Router
TypeScript
Tailwind CSS
Supabase Auth
Supabase Postgres
Supabase Row Level Security
Supabase Storage later
n8n later
OpenAI later
Stripe later
Vercel hosting
Sentry later
```

## Why Next.js Instead of React + Vite

React + Vite is excellent for frontend-only apps and internal tools, but OpsPilot is intended to become sellable SaaS. Next.js gives us:

- App Router structure
- Server Components
- Client Components
- Route Handlers for API endpoints
- Server-side auth support
- Safer secret handling
- Stripe webhook support later
- n8n secure bridge routes later
- OpenAI API routes later
- Better future custom-domain/multi-tenant routing

Important rule:

```text
Do not build this as a Vite SPA.
Do not create VITE_* environment variables.
Use Next.js and NEXT_PUBLIC_* only where browser-safe.
```

---

# 3. MVP Scope

The MVP should prove one complete business workflow:

```text
User signs in
→ workspace loads
→ dashboard loads workspace data
→ user creates a lead
→ user creates a task/job
→ dashboard metrics update
→ activity/automation log can show what happened
```

## MVP Modules

Build first:

1. Authentication
2. Workspace system
3. Dashboard overview
4. Leads
5. Jobs
6. Tasks
7. Appointments/Calendar list
8. Automation logs placeholder
9. Settings foundation
10. Branding foundation

Delay until after MVP:

1. Stripe billing
2. OpenAI assistant actions
3. n8n production workflows
4. Custom domains
5. Full invoices
6. Advanced reports
7. Mobile app
8. Deep permissions UI

---

# 4. App Architecture

## High-Level Flow

```text
Browser
↓
Next.js App Router
↓
Server Components / Client Components
↓
Route Handlers for writes and external integrations
↓
Supabase Auth + Supabase Postgres + RLS
↓
n8n / OpenAI / Stripe later through server-only routes
```

## System of Record

Supabase Postgres is the system of record.

The app must not rely on frontend-only security. Tenant boundaries must be enforced by:

```text
workspace_id
workspace_members
Supabase RLS
server-side role checks for sensitive actions
```

---

# 5. Repository Structure

Use this structure:

```text
opspilot/
├─ docs/
│  ├─ master-blueprint.md
│  ├─ db-blueprint.md
│  ├─ ui-blueprint.md
│  ├─ skill.md
│  └─ plugins-and-skills.md
├─ public/
│  └─ assets/
├─ src/
│  ├─ app/
│  │  ├─ (auth)/
│  │  │  ├─ login/
│  │  │  │  └─ page.tsx
│  │  │  └─ reset-password/
│  │  │     └─ page.tsx
│  │  ├─ (app)/
│  │  │  ├─ layout.tsx
│  │  │  ├─ dashboard/
│  │  │  │  └─ page.tsx
│  │  │  ├─ leads/
│  │  │  │  └─ page.tsx
│  │  │  ├─ jobs/
│  │  │  │  └─ page.tsx
│  │  │  ├─ tasks/
│  │  │  │  └─ page.tsx
│  │  │  ├─ calendar/
│  │  │  │  └─ page.tsx
│  │  │  ├─ automations/
│  │  │  │  └─ page.tsx
│  │  │  └─ settings/
│  │  │     └─ page.tsx
│  │  ├─ api/
│  │  │  ├─ dashboard/
│  │  │  │  └─ route.ts
│  │  │  ├─ leads/
│  │  │  │  └─ route.ts
│  │  │  ├─ jobs/
│  │  │  │  └─ route.ts
│  │  │  ├─ tasks/
│  │  │  │  └─ route.ts
│  │  │  ├─ settings/
│  │  │  │  ├─ branding/
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ modules/
│  │  │  │     └─ route.ts
│  │  │  ├─ health/
│  │  │  │  └─ route.ts
│  │  │  ├─ internal/
│  │  │  │  └─ n8n/
│  │  │  │     └─ route.ts
│  │  │  └─ stripe/
│  │  │     └─ webhook/
│  │  │        └─ route.ts
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/
│  │  ├─ app-shell/
│  │  ├─ dashboard/
│  │  ├─ forms/
│  │  ├─ ui/
│  │  └─ settings/
│  ├─ lib/
│  │  ├─ supabase/
│  │  │  ├─ client.ts
│  │  │  ├─ server.ts
│  │  │  └─ middleware.ts
│  │  ├─ auth/
│  │  ├─ tenant/
│  │  ├─ permissions/
│  │  ├─ validation/
│  │  ├─ formatting/
│  │  ├─ n8n/
│  │  ├─ stripe/
│  │  └─ ai/
│  ├─ types/
│  │  ├─ database.generated.ts
│  │  ├─ domain.ts
│  │  └─ api.ts
│  └─ middleware.ts
├─ supabase/
│  ├─ migrations/
│  ├─ seed.sql
│  └─ tests/
├─ scripts/
│  └─ generate-types.sh
├─ .env.example
├─ package.json
├─ tailwind.config.ts
├─ tsconfig.json
└─ README.md
```

---

# 6. Environment Variables

Use Next.js naming.

## Browser-safe variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_NAME=OpsPilot
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_DEMO_MODE=false
```

## Server-only variables later

```env
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
N8N_WEBHOOK_BASE_URL=
N8N_SIGNING_SECRET=
SENTRY_AUTH_TOKEN=
```

Rules:

- Never expose server-only variables in client components.
- Never use `NEXT_PUBLIC_` for secrets.
- Do not commit `.env.local`.
- `.env.example` should contain placeholders only.

---

# 7. Database Strategy

Use a shared Supabase database with tenant isolation.

Tenant boundary:

```text
workspace_id + workspace_members + RLS
```

First MVP tables:

```text
profiles
workspaces
workspace_members
workspace_branding
workspace_modules
pipeline_stages
clients
leads
jobs
tasks
appointments
message_templates
automation_logs
audit_logs
```

Later tables:

```text
custom_fields
custom_field_values
subscriptions
usage_events
messages
automation_workflows
automation_runs
ai_jobs
invoices
```

---

# 8. UI Strategy

The generated image direction remains the source of truth:

- Dark navy sidebar
- Light main workspace
- Premium rounded cards
- Purple/blue accent actions
- Clean topbar
- KPI row
- Pipeline overview
- Today agenda
- Tasks overview
- Revenue overview
- Recent activity
- AI assistant placeholder
- Mobile-friendly layout

The app must feel:

```text
premium
clean
professional
client-friendly
trustworthy
action-first
```

---

# 9. Build Order

## Phase 1 — Next.js Foundation

- Create Next.js App Router project
- Add TypeScript
- Add Tailwind
- Add path aliases
- Add folder structure
- Add design tokens
- Add base app shell

## Phase 2 — Supabase DB Foundation

- Create Supabase project
- Create migrations
- Add core workspace tables
- Add RLS helper functions
- Add RLS policies
- Add indexes
- Test one user and one workspace

## Phase 3 — Auth + Workspace Loading

- Add Supabase SSR client setup
- Add login page
- Add protected app layout
- Load active workspace
- Handle no workspace state

## Phase 4 — Premium Dashboard UI

- Build static dashboard layout
- Use empty states or safe placeholders
- Add responsive behavior
- Avoid fake production data

## Phase 5 — CRUD Core

- Leads CRUD
- Jobs CRUD
- Tasks CRUD
- Appointments list
- Dashboard metrics from real data

## Phase 6 — Customization Foundation

- Workspace branding settings
- Module toggles
- Pipeline stages
- Message templates

## Phase 7 — Automations Later

- n8n webhook bridge through Next.js route handler
- Automation logs
- New lead notification
- Follow-up reminders

## Phase 8 — AI Later

- AI draft follow-up
- AI lead summary
- AI task suggestions
- Human approval before sending anything

## Phase 9 — Billing Later

- Stripe customer
- Stripe subscription
- Stripe webhook
- Customer portal
- Subscription state in Supabase

## Phase 10 — Production Hardening

- Sentry
- Uptime monitoring
- Backup/export plan
- RLS tests
- Playwright E2E tests
- Vercel production deployment
- Supabase Pro before paid client reliability promises

---

# 10. Definition of Done for MVP

MVP foundation is done when:

- App runs on Next.js App Router
- User can log in
- User has an active workspace
- Workspace data is isolated by RLS
- Dashboard loads
- Leads/jobs/tasks can be created
- Metrics come from real data
- Empty states display when data is missing
- App shell follows premium UI direction
- Mobile layout works
- No service role key is in frontend
- Build passes
- No hardcoded fake production data

---

# 11. First Paid Client Readiness

Before selling as a serious $3,500 build:

- Vercel production deployment works
- Supabase production project exists
- RLS has been manually tested
- Basic audit logs exist
- Branding settings exist
- Lead/job/task CRUD works
- Dashboard metrics are real
- Error monitoring is added or planned
- n8n workflow is connected for at least one real automation
- Demo video is recorded
- Proposal and onboarding checklist are ready

---

# 12. Final Project Rule

This is not just a coding project.

This is a reusable SaaS foundation that should become:

```text
portfolio proof
paid client offer
white-label dashboard base
automation + dashboard business asset
```
