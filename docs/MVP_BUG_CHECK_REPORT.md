# OpsPilot MVP Bug Check Report

Date: 2026-05-09
Checkpoint: Part 3 - Database, Migrations, Supabase Schema Cache, and Full Regression QA

## Summary

OpsPilot remains aligned with the official Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth, Supabase Postgres, Supabase RLS, and Vercel stack. This checkpoint reviewed database order, RLS posture, schema-cache handling, dashboard metrics, CRUD route boundaries, and Part 1/Part 2 regression areas.

No fake production data, Stripe, n8n, OpenAI, billing, email sending, owner transfer, workspace deletion, or new file upload feature was added.

## Migrations Reviewed

- `001_extensions_and_helpers.sql`
- `002_profiles_workspaces.sql`
- `003_workspace_customization.sql`
- `004_pipeline_clients_operations.sql`
- `005_logs_templates.sql`
- `006_rls_policies.sql`
- `007_indexes.sql`
- `008_owner_console_foundation.sql`
- `009_invite_acceptance_flow.sql`
- `010_branding_storage_and_user_theme.sql`
- `20260509101425_part_2_profile_theme_and_member_visibility.sql`
- `20260509102652_part_3_workspace_member_owner_only_rls.sql`

Migration order is correct in source. `001` creates only `pgcrypto` and `handle_updated_at()`. Workspace helper functions now live in `006` after `workspace_members` exists and before policies call them. Workspace-owned MVP tables include `workspace_id`. RLS is enabled for public application tables. Seed data remains intentionally empty.

Required tables and columns are represented in migrations: `profiles`, `profiles.theme_mode`, `profiles.last_seen_at`, `workspaces`, `workspace_members`, `workspace_branding`, `workspace_modules`, `pipeline_stages`, `clients`, `leads`, `jobs`, `tasks`, `appointments`, `message_templates`, `automation_logs`, `audit_logs`, `workspace_invitations`, and `workspace_role_permissions`.

## Security And RLS Findings

- Tenant isolation is based on `workspace_id`, `workspace_members`, and RLS helper functions.
- Members can read workspace rows through membership-scoped policies.
- Owner-only invitation and role-permission tables are owner-controlled for writes.
- Invited users can read only invitations matching their authenticated email.
- Invitation acceptance rejects owner role and only permits `admin`, `manager`, `staff`, or `viewer`.
- Profile preference updates are scoped to `profiles.id = auth.uid()`.
- No public write policy was found.
- Part 3 tightened `workspace_members` write policies so role/membership management is owner-only at the database policy layer, while preserving the initial owner bootstrap rule.

## Auth And Workspace Findings

Auth is resolved server-side through Supabase SSR clients. Protected app routes load the active workspace from authenticated membership. CRUD and settings routes derive `workspace_id`, `created_by`, and `updated_by` server-side rather than accepting them from client payloads.

## Role Access Findings

Owner Console remains owner-only. Settings access remains controlled by role and workspace role permissions. Admin and manager member visibility is read-only in Settings. Staff and viewer do not receive full member visibility by default. Role changes remain owner-only.

## UI And Dark Mode Findings

Part 2 dark-mode changes preserve the dark navy sidebar and premium light workspace default while improving dark-mode readability for hard-coded white surfaces. Theme selection remains available to authenticated app-shell users and is backed by `profiles.theme_mode`.

## Schema Cache Note

If Supabase or PostgREST reports:

```text
Could not find the table in the schema cache
```

First confirm the migration was actually applied. If the migration is applied and the error appears stale, refresh the PostgREST schema cache in the Supabase SQL Editor:

```sql
NOTIFY pgrst, 'reload schema';
```

This is an operational cache refresh, not a substitute for applying migrations.

## Dashboard Metrics Confirmation

- `Revenue (Est.)` uses `jobs.estimated_value`.
- Lead `estimated_value` is not counted as revenue.
- Lead estimates remain opportunity/pipeline value only.
- Cancelled jobs are excluded from monthly estimated revenue.
- Overdue tasks are calculated dynamically from `due_at` and status.
- Today agenda uses `appointments.starts_at` and `jobs.scheduled_start`.
- Recent Activity uses real `audit_logs` and `automation_logs`.
- No fake metric values were added.

## CRUD Regression Checklist

- Leads create/load: server-authenticated, workspace-scoped, Zod-validated.
- Jobs create/load: server-authenticated, workspace-scoped, Zod-validated.
- Tasks create/load/mark done: server-authenticated, workspace-scoped, Zod-validated.
- Appointments create/load: server-authenticated, workspace-scoped, Zod-validated.
- Settings updates: role-gated through settings access context.
- Owner role updates: owner-only and non-owner roles only.
- Pending invite creation: owner-only, duplicate pending email has friendly error.
- Invite acceptance: authenticated invited email only, owner role rejected.
- Theme update: authenticated user updates only own `profiles.theme_mode`.

## Known Bugs Fixed

- Theme preference failure from missing profile table permissions/RLS support.
- Generic theme update error now reports permission/RLS issues more clearly.
- Admin/manager read-only member visibility added without role controls.
- Owner Settings now points to Owner Console instead of duplicating controls.
- Invite list grouped by status, avoids raw inviter UUIDs, and supports opening/copying invite links.
- Workspace member write RLS is now owner-only.

## Known Issues Deferred

- Full automated browser regression is still deferred until a stable authenticated test user and local Supabase session are available.
- Supabase CLI database lint could not be completed without a usable local database or Supabase auth context.
- True real-time presence is intentionally not implemented.
- Email sending for invitations is intentionally not implemented.
- Owner transfer and workspace deletion remain intentionally deferred.

## Manual Regression Checklist

1. Apply all pending migrations to the target Supabase project.
2. Sign in as owner and verify dashboard, leads, jobs, tasks, calendar, settings, and owner console load.
3. Create one lead, job, task, and appointment. Confirm dashboard metrics update from real rows.
4. Mark a task done and confirm `completed_at` updates.
5. Change theme to System, Light, and Dark. Refresh after each selection and confirm persistence.
6. Create a pending invite, copy/open the invite link, and accept as the invited email.
7. Verify admin/manager can see read-only Team Visibility in Settings.
8. Verify staff/viewer cannot see full member visibility by default.
9. Verify only owner can change member roles and access Owner Console.
10. Confirm no client request sends `workspace_id`, `created_by`, or `updated_by`.

## Recommended Next MVP Patch

Run an authenticated end-to-end QA pass against a migrated Supabase project with a known owner, admin, manager, staff, and viewer test account. Focus on role-specific route visibility, create/update flows, and post-migration schema-cache behavior.
