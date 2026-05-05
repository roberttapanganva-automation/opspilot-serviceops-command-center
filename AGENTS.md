# OpsPilot  ServiceOps Command Center — Codex Instructions

## Mission

Build OpsPilot, a premium multi-tenant SaaS operations dashboard for service businesses.

Official stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- n8n later
- OpenAI later
- Stripe later
- Vercel

## Source of Truth

Before making changes, follow these docs in `docs`

1. OpsPilot_ServiceOps_Master_Blueprint_NEXTJS.md
2. ServiceOps_Command_Center_DB_Blueprint_NEXTJS.md
3. ServiceOps_Command_Center_UI_Blueprint_NEXTJS.md
4. ServiceOps_Command_Center_Codex_SKILL_NEXTJS.md
5. OpsPilot_Codex_Plugins_and_Skills.md

## Non-Negotiable Rules

- Use Next.js App Router, not Vite.
- Do not use React Router.
- Do not expose secrets in client code.
- Only `NEXT_PUBLIC_` env vars can be used in browser code.
- Use Supabase RLS for tenant isolation.
- Every workspace-owned table must include `workspace_id`.
- Do not disable RLS to fix errors.
- Do not hardcode workspace IDs.
- Do not add fake production data.
- Use empty states if no data exists.
- Keep the dark navy sidebar and light main workspace design.
- Make small safe patches.
- Run `npm run build` after meaningful changes.
- Explain every file changed.

## UI Direction

The app should feel like a premium SaaS dashboard
- dark navy sidebar
- light workspace
- rounded cards
- purpleblue accents
- clean topbar
- KPI cards
- pipeline overview
- today agenda
- recent activity
- AI assistant placeholder
- mobile-friendly layout

## Build Order

1. Next.js foundation
2. Design tokens and app shell
3. Supabase DB foundation
4. Supabase auth
5. Workspace loading
6. Dashboard UI
7. Leads CRUD
8. Jobs CRUD
9. Tasks CRUD
10. Dashboard real metrics
11. Settings foundation
12. n8n later
13. Stripe later
14. OpenAI later