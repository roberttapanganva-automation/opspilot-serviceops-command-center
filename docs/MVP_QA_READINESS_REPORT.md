# OpsPilot MVP QA Readiness Report

## Overall MVP Status

OpsPilot is in a solid MVP foundation state. The app uses the official Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth, Supabase Postgres, and Supabase RLS stack. Auth, workspace loading, dashboard metrics, core operational CRUD, appointments, settings, role-aware navigation, and settings access controls are present.

This review found one small production-readiness gap: operational write routes relied on UI hiding for viewer roles. The routes now enforce workspace role checks server-side for create/update actions.

## What Was Checked

- Environment variable placeholders and Git tracking behavior.
- Supabase browser, server, and middleware clients.
- Protected route middleware and static asset exclusions.
- Active workspace resolution from authenticated workspace membership.
- Role permission helpers and role-based app shell behavior.
- CRUD route auth, workspace resolution, Zod validation, and error responses.
- Settings API owner/admin checks.
- Dashboard query logic and data honesty.
- UI direction, mobile navigation constraints, accessible icon buttons, and icon library usage.
- Searches for service role usage, client-supplied `workspace_id`, fake/demo production data, `lucide-react`, `VITE_`, Stripe, n8n, and OpenAI code.

## Files Reviewed

- `.env.example`
- `.gitignore`
- `package.json`
- `src/middleware.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/env.ts`
- `src/lib/tenant/getActiveWorkspace.ts`
- `src/lib/permissions/workspace.ts`
- `src/lib/settings/access.ts`
- `src/lib/settings/api.ts`
- `src/lib/dashboard/queries.ts`
- `src/lib/validation/leads.ts`
- `src/lib/validation/jobs.ts`
- `src/lib/validation/tasks.ts`
- `src/lib/validation/appointments.ts`
- `src/lib/validation/settings.ts`
- `src/app/api/leads/route.ts`
- `src/app/api/jobs/route.ts`
- `src/app/api/tasks/route.ts`
- `src/app/api/tasks/[taskId]/route.ts`
- `src/app/api/appointments/route.ts`
- `src/app/api/settings/workspace/route.ts`
- `src/app/api/settings/branding/route.ts`
- `src/app/api/settings/modules/route.ts`
- `src/app/api/settings/pipeline-stages/route.ts`
- `src/app/api/settings/pipeline-stages/[stageId]/route.ts`
- `src/app/(app)/layout.tsx`
- `src/app/(app)/dashboard/page.tsx`
- `src/app/(app)/leads/page.tsx`
- `src/app/(app)/jobs/page.tsx`
- `src/app/(app)/tasks/page.tsx`
- `src/app/(app)/calendar/page.tsx`
- `src/app/(app)/settings/page.tsx`
- `src/components/app-shell/AppShell.tsx`
- `src/components/app-shell/Sidebar.tsx`
- `src/components/app-shell/Topbar.tsx`
- `src/components/app-shell/MobileNav.tsx`
- `src/components/app-shell/nav-items.ts`
- Dashboard, leads, jobs, tasks, calendar, settings, and UI components.
- `supabase/migrations/001_extensions_and_helpers.sql`
- `supabase/migrations/002_profiles_workspaces.sql`
- `supabase/migrations/003_workspace_customization.sql`
- `supabase/migrations/004_pipeline_clients_operations.sql`
- `supabase/migrations/005_logs_templates.sql`
- `supabase/migrations/006_rls_policies.sql`
- `supabase/migrations/007_indexes.sql`

## Issues Found

1. Viewer role write protection was incomplete at the application route layer.
   - UI controls were hidden for viewers, but `/api/leads`, `/api/jobs`, `/api/tasks`, `/api/tasks/[taskId]`, and `/api/appointments` did not explicitly reject viewer writes.

2. RLS write policies for operational tables still use active workspace membership for inserts/updates.
   - This matches the earlier MVP broad-member policy, but it is not the final viewer-read-only database posture.
   - Because this patch avoids migration/schema changes unless absolutely necessary, this is documented as a deferred RLS-hardening item.

3. Next.js reports that the `middleware` file convention is deprecated in favor of `proxy`.
   - The current file still builds and protects routes.
   - Renaming middleware to proxy should be handled in a focused compatibility patch.

4. Supabase Data API exposure rules are changing.
   - Supabase now requires explicit grants for newly created tables in projects that opt into the new Data API default behavior, and this becomes more broadly relevant in 2026.
   - Current migrations rely on RLS and policies but should be checked against the project's Data API grant settings before production deployment.

## Issues Fixed

- Added server-side `canCreateOperationalRecords` checks to:
  - `/api/leads`
  - `/api/jobs`
  - `/api/tasks`
  - `/api/appointments`

- Added server-side `canEditOperationalRecords` check to:
  - `/api/tasks/[taskId]`

These checks keep owner, admin, manager, and staff write behavior intact while returning `403` for viewer writes.

## Issues Intentionally Deferred

- Owner Console Foundation.
- Team invitations.
- Stripe billing.
- n8n workflow logic.
- OpenAI assistant logic.
- File/logo uploads.
- RLS migration tightening for viewer-read-only operational writes.
- Next.js `middleware.ts` to `proxy.ts` rename.
- End-to-end tests and browser automation.
- Production monitoring and error reporting.

## Security Notes

- No Supabase service role key is used in application code.
- Browser Supabase client uses only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Server and route-handler Supabase access uses the SSR cookie client with the anon key, so RLS remains active.
- `.env.local` exists locally but is ignored by `.gitignore` and is not tracked by Git.
- No `workspace_id` is accepted from client request bodies for active workspace resolution.
- Operational and settings routes derive workspace scope from the authenticated user's active workspace.
- Settings mutations enforce owner/admin access server-side.

## RLS Notes

- RLS is enabled in migrations for workspace-owned tables.
- Helper functions `is_workspace_member` and `has_workspace_role` are present in the RLS migration after the workspace membership table exists.
- Settings and customization write policies are owner/admin restricted.
- Operational table insert/update policies currently allow active workspace members. This is acceptable for the earlier broad MVP model but should be tightened in a future RLS migration if viewer read-only must be enforced directly at the database layer.
- Before production deployment, verify Supabase Data API grants for all public tables used through `supabase-js`. Supabase's 2026 Data API default-grant changes make this an explicit deployment checklist item.

## Role Access Notes

- `owner` and `admin`: can manage settings, branding, modules, pipeline stages, and operational records.
- `manager` and `staff`: can access operational pages and create/edit operational records.
- `viewer`: can view workspace records where allowed, cannot see create actions in the UI, and now receives server-side `403` responses for the reviewed operational write routes.
- Settings navigation is hidden for non-owner/admin roles.
- Settings page shows a restricted state for non-owner/admin roles and does not expose editable forms.

## Data Honesty Notes

- Dashboard KPI values are loaded from workspace data.
- Estimated revenue is based on `jobs.estimated_value`, not lead opportunity value.
- Cancelled jobs are excluded from monthly estimated revenue.
- Overdue tasks are calculated dynamically from `due_at` and status.
- Empty states are used when data is missing.
- No fake production data, demo data, or Acme/test data was added.

## Manual QA Checklist

- Sign in as an owner/admin and confirm Settings is visible and editable.
- Sign in as manager/staff and confirm Settings is hidden or restricted.
- Sign in as viewer and confirm Settings is hidden or restricted.
- As viewer, confirm Add buttons are hidden on Leads, Jobs, Tasks, Calendar, and Topbar.
- As viewer, manually call operational POST/PATCH routes and confirm `403`.
- As owner/admin/manager/staff, create a lead, job, task, and appointment.
- Confirm dashboard metrics update after creating real records.
- Confirm records from one workspace do not appear in another workspace.
- Confirm empty states display in an empty workspace.
- Confirm mobile navigation shows no more than five items and does not overflow.
- Confirm `.env.local` remains untracked before pushing.
- Confirm Supabase Data API grants and RLS behavior in the target production project.

## Recommended Next Patch

Patch 16: Owner Console Foundation

Suggested scope:
- Owner-only console route.
- Workspace/user overview.
- Read-only tenant diagnostics.
- RLS-safe admin visibility without service role usage.
- No billing, invitations, file uploads, n8n, or OpenAI yet.
