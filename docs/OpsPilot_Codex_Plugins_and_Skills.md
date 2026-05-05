# OpsPilot — Codex Plugins, Skills, and Companion Tools

## Purpose

This file lists the plugins, skills, tools, extensions, and supporting references that should accompany the OpsPilot build when working with Codex.

The goal is to help Codex implement safely and help Robert validate the build step by step.

---

# 1. Core Build Tools

## Required

| Tool | Purpose |
|---|---|
| Node.js LTS | Runtime for Next.js |
| npm | Package manager |
| Git | Version control |
| GitHub | Repository and backup |
| VS Code | Local editing |
| Codex | Code generation, patching, review |
| Supabase CLI | Local migrations, DB types, Supabase workflow |
| Vercel CLI | Deployment and environment checks later |

Recommended install/check commands:

```bash
node -v
npm -v
git --version
supabase --version
vercel --version
```

---

# 2. VS Code Extensions

Recommended extensions:

| Extension | Why it helps |
|---|---|
| ESLint | Catches code quality issues |
| Prettier | Formatting |
| Tailwind CSS IntelliSense | Tailwind class suggestions |
| TypeScript Importer | Helps imports |
| Error Lens | Shows errors inline |
| GitLens | Git history and changed files |
| DotENV | .env syntax highlighting |
| PostgreSQL / SQLTools | SQL editing |
| Supabase extension | Supabase workflow support if preferred |
| Playwright Test for VS Code | E2E testing later |
| Thunder Client or REST Client | Test API routes |
| Markdown All in One | Manage blueprint docs |
| Code Spell Checker | Catch typos in docs/UI labels |

---

# 3. Project Skill Files to Add to Sources

Add these to ChatGPT project sources and also keep copies in the repo under `/docs`.

## Required skills/docs

```text
OpsPilot_ServiceOps_Master_Blueprint_NEXTJS.md
ServiceOps_Command_Center_DB_Blueprint_NEXTJS.md
ServiceOps_Command_Center_UI_Blueprint_NEXTJS.md
ServiceOps_Command_Center_Codex_SKILL_NEXTJS.md
OpsPilot_Codex_Plugins_and_Skills.md
```

## Optional future skill files

Create later when needed:

```text
OpsPilot_Supabase_RLS_SKILL.md
OpsPilot_NextJS_App_Router_SKILL.md
OpsPilot_UI_Design_System_SKILL.md
OpsPilot_n8n_Automation_SKILL.md
OpsPilot_Stripe_Billing_SKILL.md
OpsPilot_QA_Testing_SKILL.md
OpsPilot_Security_Deployment_SKILL.md
OpsPilot_Client_Sales_Demo_SKILL.md
```

---

# 4. Codex Working Modes

Use Codex in small controlled patches.

## Best Codex task types

1. Scaffold project
2. Create a component
3. Create one migration
4. Fix TypeScript errors
5. Review security rules
6. Generate tests
7. Refactor one page
8. Create one API route
9. Connect one CRUD flow
10. Review build errors

## Avoid asking Codex to do this in one task

```text
Build the entire SaaS dashboard.
```

Better:

```text
Create the Next.js foundation only.
```

Then:

```text
Create the Supabase workspace tables and RLS helpers only.
```

Then:

```text
Build the static dashboard UI shell only.
```

---

# 5. Recommended npm Packages

## Initial MVP

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install lucide-react date-fns zod
npm install react-hook-form @hookform/resolvers
npm install recharts
```

## UI helpers optional

```bash
npm install clsx tailwind-merge class-variance-authority
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot
```

## Later

```bash
npm install @tanstack/react-table
npm install @sentry/nextjs
npm install stripe
npm install posthog-js
```

---

# 6. Recommended Dev Scripts

Add scripts where possible:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

Testing later:

```json
{
  "scripts": {
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

---

# 7. Supabase Skills Needed

Codex should be guided with these themes:

## Supabase Auth Skill

Covers:

- login
- logout
- session loading
- middleware refresh
- protected routes
- user profile creation

## Supabase RLS Skill

Covers:

- workspace isolation
- helper functions
- RLS policies
- role checks
- policy testing
- avoiding service role misuse

## Supabase Migration Skill

Covers:

- migration file order
- SQL naming
- generated TypeScript types
- local vs production apply

---

# 8. Next.js Skills Needed

## App Router Skill

Covers:

- `src/app`
- layouts
- route groups
- server components
- client components
- route handlers
- metadata
- loading/error pages

## Server/Client Boundary Skill

Rules:

- Server Components for data loading where possible
- Client Components only for interactive state
- Do not use browser-only hooks in Server Components
- Do not expose secrets in Client Components

## Route Handler Skill

Covers:

- API endpoints
- request validation
- protected writes
- webhooks later
- typed response shapes

---

# 9. UI/UX Skills Needed

## Premium Dashboard UI Skill

Covers:

- dark sidebar/light workspace
- KPI cards
- clean chart cards
- mobile layout
- empty/loading/error states
- app shell consistency

## Design System Skill

Covers:

- Button
- Card
- Badge
- Input
- Modal/Drawer
- Skeleton
- EmptyState
- StatusBadge

## Accessibility Skill

Covers:

- keyboard navigation
- focus rings
- aria-labels
- dialog focus trap
- color contrast
- form labels

---

# 10. Automation Skills Needed Later

## n8n Integration Skill

Covers:

- Next.js route handler as secure bridge
- n8n webhook call
- signing secret
- automation_logs
- retries
- failure visibility

Initial workflows:

```text
New Lead Notification
Follow-up Reminder
AI Draft Follow-up
```

## OpenAI AI Assistant Skill

Covers:

- server-only OpenAI API key
- draft-only AI actions
- no auto-send without approval
- structured outputs later
- audit/automation logs

## Stripe Billing Skill

Covers:

- customer creation
- subscription table
- billing portal
- webhook verification
- plan state
- feature limits

---

# 11. QA and Deployment Skills

## Testing Skill

Tools:

```text
Vitest
React Testing Library
Playwright
Supabase pgTAP later
```

Test flows:

- login
- create lead
- create task
- create job
- dashboard metrics
- workspace isolation

## Security Review Skill

Checklist:

- no secrets in browser
- RLS enabled
- workspace_id on business tables
- server-only keys server-only
- no fake production data
- API routes validate input

## Deployment Skill

Tools:

```text
Vercel
Supabase
GitHub
Sentry later
Better Stack/UptimeRobot later
```

---

# 12. Recommended Build Companion Checklist

Before each Codex patch:

```text
1. What phase are we in?
2. Which file is source of truth?
3. Which exact files should Codex touch?
4. What must Codex not change?
5. What validation command must run?
```

After each Codex patch:

```text
1. Did build pass?
2. Did UI still match direction?
3. Did table names match DB blueprint?
4. Did it expose secrets?
5. Did it add fake data?
6. Did it change unrelated files?
7. Did it keep mobile usable?
```

---

# 13. Suggested ChatGPT Project Skills to Create

These are not software plugins. They are project-source skill files that keep guidance consistent.

## 1. Next.js App Router Implementation Skill

Use for:

- pages
- layouts
- route handlers
- server/client components

## 2. Supabase RLS Implementation Skill

Use for:

- database migrations
- workspace isolation
- role policies

## 3. Premium SaaS UI Design Skill

Use for:

- dashboard styling
- responsive UI
- reusable components

## 4. Codex Patch Workflow Skill

Use for:

- small safe patches
- validation
- avoiding hallucinated rewrites

## 5. SaaS Security and Deployment Skill

Use for:

- env vars
- secrets
- Vercel/Supabase deployment
- monitoring

## 6. n8n Automation Integration Skill

Use later for:

- lead notification
- reminder workflow
- automation logs

## 7. Client Demo and Sales Skill

Use later for:

- Loom demo script
- pricing package
- proposal
- portfolio case study

---

# 14. Final Recommendation

Start with only these active companion skills:

```text
1. Codex Patch Workflow Skill
2. Next.js App Router Skill
3. Supabase RLS Skill
4. Premium SaaS UI Skill
```

Add these later:

```text
5. n8n Automation Skill
6. Stripe Billing Skill
7. QA/Security Deployment Skill
8. Client Sales Demo Skill
```
