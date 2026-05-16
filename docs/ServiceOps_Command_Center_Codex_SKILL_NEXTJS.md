# ServiceOps Command Center — Codex SKILL NEXTJS

## Mission

Build **OpsPilot / ServiceOps Command Center**, a premium, multi-tenant, white-label-ready SaaS operations dashboard for service businesses.

Official stack:

```text
Next.js App Router
TypeScript
Tailwind CSS
Supabase Auth
Supabase Postgres
Supabase RLS
n8n later
OpenAI later
Stripe later
Vercel
```

This file replaces earlier React/Vite Codex instructions.

---

# Current Implementation Snapshot

- Normal app routes include `/dashboard`, `/leads`, `/jobs`, `/tasks`, `/calendar`, `/automations`, `/settings`, and `/pipelines`.
- Owner Console routes include `/owner`, `/owner/team`, `/owner/invitations`, `/owner/branding`, `/owner/modules`, `/owner/pipeline`, `/owner/access-rules`, and `/owner/audit-logs`.
- Workspace-wide controls are owner-only and live in Owner Console. Normal Settings is personal/account and role-limited.
- Personal theme preference is stored in `profiles.theme_mode` and is separate from the workspace default theme.
- Dashboard Pipeline Overview is preview-only; `/pipelines` is the full working board.
- Grouped pipelines use `pipeline_groups` and grouped stage uniqueness through `pipeline_stages.pipeline_group_id`.
- Current icon family is Phosphor Icons.

---

# 1. Source of Truth Files

Codex must follow these files:

```text
OpsPilot_ServiceOps_Master_Blueprint_NEXTJS.md
ServiceOps_Command_Center_DB_Blueprint_NEXTJS.md
ServiceOps_Command_Center_UI_Blueprint_NEXTJS.md
ServiceOps_Command_Center_Codex_SKILL_NEXTJS.md
OpsPilot_Codex_Plugins_and_Skills.md
```

If files conflict, follow this priority:

1. Codex SKILL NEXTJS
2. DB Blueprint NEXTJS
3. UI Blueprint NEXTJS
4. Master Blueprint NEXTJS
5. Plugins and Skills reference

---

# 2. Non-Negotiable Rules

## Stack Rules

- Use Next.js App Router.
- Do not create a Vite app.
- Do not use React Router.
- Use TypeScript.
- Use Tailwind CSS.
- Use Supabase SSR helpers/pattern.
- Use route handlers for API endpoints.

## Security Rules

- Never expose service role keys in client code.
- Never expose OpenAI, Stripe, or n8n secrets in client code.
- Only `NEXT_PUBLIC_*` variables may be used in browser code.
- Use RLS for tenant isolation.
- Use `workspace_id` on workspace-owned tables.
- Do not disable RLS to fix errors.
- Do not hardcode workspace IDs.
- Do not trust client-supplied user IDs for permissions.
- Do not accept `workspace_id` from client payloads for normal app writes.
- Do not trust client-supplied role or entity values when the server can derive them safely.

## Data Rules

- No fake production data.
- Empty states instead of fake numbers.
- Demo data only if explicit demo mode exists.
- Use UUID primary keys.
- Use `timestamptz`.
- Use generated Supabase types when available.
- Do not invent schema names that conflict with DB Blueprint.

## UI Rules

- Preserve dark navy sidebar + light workspace.
- Follow UI Blueprint.
- Use tokens.
- Keep UI premium and uncluttered.
- Use clear business language.
- Make mobile responsive.
- Build reusable components.
- Avoid unnecessary `use client`.
- Keep Owner Console separate from normal Settings.
- Keep workspace branding changes limited to safe accent variables, not structural contrast colors.

## Development Rules

- Small safe patches.
- Inspect files before editing.
- Do not rewrite unrelated files.
- Run build/typecheck after meaningful changes.
- Explain changed files.
- Report errors honestly.
- Ask before changing architecture.
- Validate permission-sensitive changes in both the UI and server route.

---

# 3. Required Next.js Structure

Codex should create this structure:

```text
src/
  app/
    layout.tsx
    globals.css
    page.tsx
    (auth)/
      login/page.tsx
      reset-password/page.tsx
    (app)/
      layout.tsx
      dashboard/page.tsx
      leads/page.tsx
      jobs/page.tsx
      tasks/page.tsx
      calendar/page.tsx
      automations/page.tsx
      pipelines/page.tsx
      settings/page.tsx
    (owner)/
      owner/
        layout.tsx
        page.tsx
        team/page.tsx
        invitations/page.tsx
        branding/page.tsx
        modules/page.tsx
        pipeline/page.tsx
        access-rules/page.tsx
        audit-logs/page.tsx
    api/
      health/route.ts
      leads/route.ts
      leads/[leadId]/route.ts
      jobs/route.ts
      jobs/[jobId]/route.ts
      tasks/route.ts
      tasks/[taskId]/route.ts
      appointments/route.ts
      appointments/[appointmentId]/route.ts
      pipelines/route.ts
      pipelines/cards/move/route.ts
      owner/
        access-rules/route.ts
        branding/route.ts
        branding/upload/route.ts
        invitations/route.ts
        invitations/[invitationId]/route.ts
        members/[memberId]/role/route.ts
        pipeline-groups/route.ts
        pipeline-groups/[groupId]/route.ts
        pipeline-stages/route.ts
        pipeline-stages/[stageId]/route.ts
      settings/
        branding/route.ts
        modules/route.ts
        pipeline-stages/route.ts
        pipeline-stages/[stageId]/route.ts
  components/
    app-shell/
    dashboard/
    jobs/
    leads/
    owner/
    pipelines/
    settings/
    tasks/
    ui/
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    auth/
    tenant/
    permissions/
    validation/
    formatting/
    n8n/
    stripe/
    ai/
  types/
    database.generated.ts
    domain.ts
    api.ts
  middleware.ts
```

---

# 4. Environment Variables

Create `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_NAME=OpsPilot
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_DEMO_MODE=false

SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
N8N_WEBHOOK_BASE_URL=
N8N_SIGNING_SECRET=
SENTRY_DSN=
```

Rules:

- Leave values blank.
- Do not invent keys.
- Do not commit `.env.local`.

---

# 5. Database Build Instructions

Use Supabase migrations.

Build order:

```text
001_extensions_and_helpers.sql
002_profiles_workspaces.sql
003_workspace_customization.sql
004_pipeline_clients_operations.sql
005_logs_templates.sql
006_rls_policies.sql
007_indexes.sql
008_owner_console_foundation.sql
009_invite_acceptance_flow.sql
010_branding_storage_and_user_theme.sql
011_fix_profile_theme_preference_rls.sql
012_workspace_branding_storage.sql
013_pipeline_groups_and_board.sql
014_fix_pipeline_stage_group_uniqueness.sql
```

MVP tables:

```text
profiles
workspaces
workspace_members
workspace_branding
workspace_modules
pipeline_stages
pipeline_groups
clients
leads
jobs
tasks
appointments
message_templates
automation_logs
audit_logs
workspace_invitations
workspace_role_permissions
```

Naming must match DB Blueprint exactly.

Important official field names:

```text
workspace_branding
clients
starts_at
ends_at
scheduled_start
scheduled_end
estimated_value
actual_value
assigned_to
created_by
updated_by
```

Do not use these older/alternate names:

```text
branding_settings
contacts
start_at
end_at
scheduled_at
value
```

---

# 6. Supabase Client Rules

Create:

```text
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/supabase/middleware.ts
```

Use:

- Browser client for client components
- Server client for Server Components and Route Handlers
- Middleware for session refresh/protected route behavior

Do not use service role key in normal app reads/writes.

Use service role key only in explicit server-only admin workflows later, and document why.

---

# 7. Route Handler Rules

Use Next.js Route Handlers for writes and server-side operations.

Initial API routes:

```text
/api/health
/api/dashboard
/api/leads
/api/jobs
/api/tasks
/api/settings/branding
/api/settings/modules
```

Later API routes:

```text
/api/internal/n8n
/api/stripe/webhook
/api/ai/draft-follow-up
```

Every write route must:

1. Load authenticated user.
2. Resolve workspace.
3. Check workspace membership/role.
4. Validate request with Zod.
5. Perform Supabase operation.
6. Write audit log where appropriate.
7. Return typed response.

Response format:

```ts
type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiError = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

---

# 8. UI Implementation Rules

Create reusable UI components first:

```text
Button
Card
Badge
Input
Modal/Drawer
Skeleton
EmptyState
StatusBadge
SectionHeader
```

Dashboard components:

```text
StatCard
PipelineOverview
TodayAgenda
TasksOverview
RevenueOverview
RecentActivity
AIAssistantCard
```

App shell components:

```text
AppShell
Sidebar
Topbar
WorkspaceSwitcher
MobileNav
UserMenu
```

Use Phosphor Icons for product UI.

Use honest preview states where charts or advanced surfaces are not fully wired yet.

---

# 9. Build Order for Codex

## Step 1 — Project Scaffold

Create Next.js App Router project with:

- TypeScript
- Tailwind
- ESLint
- src directory
- app router
- path alias

Validation:

```bash
npm run build
```

## Step 2 — Design Tokens + App Shell

Add:

- `globals.css` tokens
- app shell
- sidebar
- topbar
- empty dashboard page

Validation:

```bash
npm run build
```

## Step 3 — Supabase DB Foundation

Add migrations:

- extensions/helper functions
- workspace tables
- RLS policies
- indexes

Validation:

```bash
supabase db lint
```

If Supabase CLI unavailable, explain manual SQL steps.

## Step 4 — Supabase Auth

Add:

- Supabase clients
- login page
- sign out
- protected app layout
- middleware session handling

Validation:

```bash
npm run build
```

## Step 5 — Workspace Loading

Add:

- active workspace resolver
- no workspace state
- workspace branding/modules loading

## Step 6 — Static Dashboard UI

Build full dashboard layout following UI blueprint.

No fake production data.

## Step 7 — Leads CRUD

Add:

- leads page
- create lead
- update lead
- empty/loading/error states

## Step 8 — Jobs CRUD

Add:

- jobs page
- create job
- schedule fields
- revenue estimate

## Step 9 — Tasks CRUD

Add:

- tasks page
- create task
- mark done
- overdue calculation

## Step 10 — Dashboard Real Metrics

Connect:

- new leads
- jobs booked
- revenue estimate
- overdue tasks
- today agenda
- recent activity

## Step 11 — Settings Foundation

Add:

- personal/account settings
- personal theme preference
- role-limited settings visibility

## Step 12 — Automation Foundation Later

Add:

- automation logs
- n8n route placeholder
- new lead workflow later

---

# 9A. Current Owner Console Direction

- Owner Console is the owner-only workspace control area.
- Normal Settings remains personal/account and role-limited.
- Branding, modules, grouped pipelines, access rules, invites, and audit logs belong in Owner Console.
- Invite roles exclude `owner`.
- Pipeline board preview lives on the dashboard; `/pipelines` is the full working board.

---

# 10. Validation Commands

Use when available:

```bash
npm run build
npm run lint
npm run typecheck
```

Supabase:

```bash
supabase db lint
supabase migration list
supabase db push --dry-run
```

Testing later:

```bash
npm test
npx playwright test
```

Codex must report which commands were run.

---

# 11. First Codex Prompt

Use this for the first patch:

```text
Reasoning level: High

You are building OpsPilot / ServiceOps Command Center from scratch.

Official stack:
Next.js App Router + TypeScript + Tailwind CSS + Supabase.

Read and follow these project files:
1. OpsPilot_ServiceOps_Master_Blueprint_NEXTJS.md
2. ServiceOps_Command_Center_DB_Blueprint_NEXTJS.md
3. ServiceOps_Command_Center_UI_Blueprint_NEXTJS.md
4. ServiceOps_Command_Center_Codex_SKILL_NEXTJS.md

Task:
Create the initial Next.js App Router project foundation.

Requirements:
- Use Next.js App Router, not Vite.
- Use TypeScript.
- Use Tailwind CSS.
- Use src/ directory.
- Use path alias.
- Create the folder structure from the Codex skill file.
- Add .env.example with Next.js/Supabase placeholders only.
- Add src/app/globals.css with OpsPilot design tokens.
- Create a basic app shell placeholder with dark navy sidebar and light main workspace.
- Do not connect Supabase yet.
- Do not create CRUD yet.
- Do not add fake production data.
- Keep the app compiling.

After the patch:
- List every file created or changed.
- Explain what each file does.
- Run npm run build.
- Report any errors honestly.
```

---

# 12. Supabase DB Prompt

```text
Reasoning level: High

You are implementing the Supabase database foundation for OpsPilot.

Read and follow:
1. ServiceOps_Command_Center_DB_Blueprint_NEXTJS.md
2. ServiceOps_Command_Center_Codex_SKILL_NEXTJS.md

Task:
Create the first Supabase migrations for the multi-tenant workspace foundation.

Include:
- pgcrypto extension
- handle_updated_at function
- is_workspace_member function
- has_workspace_role function
- profiles
- workspaces
- workspace_members
- workspace_branding
- workspace_modules
- pipeline_stages
- RLS enablement
- safe RLS policies
- indexes

Rules:
- Use UUID primary keys.
- Use workspace_id on workspace-owned tables.
- Use auth.users references correctly.
- Do not disable RLS.
- Do not create fake users.
- Do not seed production data.
- Keep names aligned with the DB blueprint.

After the patch:
- List changed files.
- Explain tables.
- Explain RLS logic.
- Explain how to apply migrations.
```

---

# 13. UI Dashboard Prompt

```text
Reasoning level: High

You are building the OpsPilot premium SaaS dashboard UI.

Read and follow:
1. ServiceOps_Command_Center_UI_Blueprint_NEXTJS.md
2. ServiceOps_Command_Center_Codex_SKILL_NEXTJS.md

Task:
Build the first static dashboard UI shell in Next.js App Router.

Requirements:
- Use src/app/(app)/layout.tsx for protected app shell placeholder.
- Create dark navy sidebar.
- Create light main workspace.
- Create topbar with search, Add New button, notification icons, avatar placeholder.
- Create dashboard greeting.
- Create KPI cards:
  - New Leads
  - Jobs Booked
  - Revenue (Est.)
  - Overdue Tasks
- Create cards:
  - Pipeline Overview
  - Today's Agenda
  - Tasks Overview
  - Revenue Overview
  - Recent Activity
  - AI Assistant
- Use reusable components.
- Use lucide-react icons.
- Do not connect Supabase in this patch.
- Do not use fake production data.
- If layout placeholders are necessary, mark them clearly as temporary.
- Make it responsive.

After the patch:
- List changed files.
- Explain component structure.
- Run npm run build.
```

---

# 14. What Codex Must Ask Before Doing

Codex must ask before:

1. Deleting important files.
2. Changing from Next.js to another framework.
3. Adding paid services.
4. Adding a new UI framework.
5. Changing DB table names.
6. Introducing sample data.
7. Using service role key.
8. Building Stripe billing.
9. Connecting external email/SMS.
10. Changing app design direction.

---

# 15. What Codex Can Do Without Asking

Codex can:

1. Create folders from blueprint.
2. Add design tokens.
3. Add reusable components.
4. Add empty/loading/error states.
5. Fix TypeScript errors.
6. Improve accessibility labels.
7. Split large components.
8. Add small utilities.
9. Run build/lint.
10. Add comments for non-obvious logic.

---

# 15A. Current Special Rules

- Owner Console is owner-only.
- Role permissions should flow through `workspace_role_permissions` and server-side checks.
- Personal theme preference is available to authenticated roles through `profiles.theme_mode`.
- Dashboard Pipeline Overview is preview-only.
- `/pipelines` is the full working board.
- Do not use a service role key for normal app writes.
- Do not add fake leads, jobs, tasks, cards, or pipeline stages.
- Invitation email sending is deferred.

---

# 16. MVP Done Criteria

Done means:

- Next.js app builds.
- Auth works.
- Workspace loads.
- RLS protects workspace data.
- Dashboard uses real data.
- Leads/jobs/tasks CRUD works.
- Empty states exist.
- Premium UI direction is preserved.
- Mobile layout works.
- No secrets in frontend.
- No fake production data.
