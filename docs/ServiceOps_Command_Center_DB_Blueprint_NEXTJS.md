# ServiceOps Command Center — Database Blueprint NEXTJS

## Purpose

This is the revised database blueprint for **OpsPilot / ServiceOps Command Center**.

It is aligned with the official Next.js App Router direction and should be used as the database source of truth for Codex.

The database stack is:

```text
Supabase Auth
Supabase Postgres
Supabase Row Level Security
Supabase migrations
Generated TypeScript database types
```

---

# 1. Database Principles

## Multi-Tenant From Day One

Every business account is a workspace.

Most business tables must include:

```sql
workspace_id uuid not null references public.workspaces(id) on delete cascade
```

## Security Boundary

Tenant access is controlled by:

```text
auth.users
profiles
workspaces
workspace_members
RLS policies
```

## Never Trust the Frontend Alone

The frontend may hide UI actions, but the database must enforce access using RLS.

## Database-Driven Customization

Do not hardcode:

- pipeline stages
- branding
- module visibility
- message templates
- custom fields later

Store these in tables.

---

# 2. Official MVP Tables

Build these first:

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

Current implementation additions:

```text
workspace_invitations
workspace_role_permissions
pipeline_groups
profiles.theme_mode
profiles.last_seen_at
pipeline_stages.pipeline_group_id
workspace-branding Supabase Storage bucket
```

Optional later:

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

# 3. Naming Decisions

Use these names consistently:

| Concept | Official table/field |
|---|---|
| White-label branding | `workspace_branding` |
| Customer/contact | `clients` |
| Appointment start | `starts_at` |
| Appointment end | `ends_at` |
| Job schedule start | `scheduled_start` |
| Job schedule end | `scheduled_end` |
| Estimated job revenue | `estimated_value` |
| Actual job revenue | `actual_value` |
| Assigned user | `assigned_to` |
| Created user | `created_by` |
| Updated user | `updated_by` |

Avoid mixing these alternatives in MVP:

```text
branding_settings
contacts
start_at/end_at
scheduled_at
value
```

---

# 4. Recommended Migration Order

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

---

# 5. Helper Functions

## Updated At Trigger

```sql
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

## Workspace Membership Check

```sql
create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  );
$$;
```

## Workspace Role Check

```sql
create or replace function public.has_workspace_role(target_workspace_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wm.role = any(allowed_roles)
  );
$$;
```

After creating functions:

```sql
revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.has_workspace_role(uuid, text[]) from public;

grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.has_workspace_role(uuid, text[]) to authenticated;
```

---

# 6. Core Tables

## profiles

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## workspaces

```sql
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  industry text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'trial', 'suspended')),
  currency_code text not null default 'USD',
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## workspace_members

```sql
create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('owner', 'admin', 'manager', 'staff', 'viewer')),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  invited_email text,
  invited_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);
```

---

# 7. Customization Tables

## workspace_branding

```sql
create table public.workspace_branding (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  app_name text not null default 'OpsPilot',
  logo_url text,
  icon_url text,
  primary_color text not null default '#6D5DFC',
  accent_color text not null default '#4F46E5',
  login_heading text default 'Welcome back',
  login_subtext text default 'Sign in to manage your business operations.',
  theme_mode text not null default 'system' check (theme_mode in ('system', 'light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## workspace_modules

```sql
create table public.workspace_modules (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  leads_enabled boolean not null default true,
  jobs_enabled boolean not null default true,
  tasks_enabled boolean not null default true,
  calendar_enabled boolean not null default true,
  reports_enabled boolean not null default true,
  automations_enabled boolean not null default true,
  ai_enabled boolean not null default false,
  invoices_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## pipeline_groups

Owner-managed pipeline folders for lead and job workflows.

```sql
create table public.pipeline_groups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  entity_type text not null check (entity_type in ('lead', 'job')),
  order_index integer not null default 0,
  is_default boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, entity_type, name)
);
```

## pipeline_stages

Current grouped pipeline rule:

```text
Stage names are unique inside a pipeline group:
(workspace_id, pipeline_group_id, name)

The same stage name may exist in different pipeline groups.
```

```sql
create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  pipeline_group_id uuid not null references public.pipeline_groups(id) on delete cascade,
  entity_type text not null check (entity_type in ('lead', 'job')),
  name text not null,
  color text not null default '#6D5DFC',
  order_index integer not null default 0,
  is_closed boolean not null default false,
  is_won boolean not null default false,
  is_lost boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, pipeline_group_id, name)
);
```

---

# 8. Operations Tables

## clients

```sql
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company_name text,
  address text,
  notes text,
  source text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## leads

```sql
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  stage_id uuid references public.pipeline_stages(id) on delete set null,
  title text not null,
  source text default 'manual',
  estimated_value numeric(12,2) not null default 0,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'won', 'lost')),
  assigned_to uuid references auth.users(id) on delete set null,
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## jobs

```sql
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  stage_id uuid references public.pipeline_stages(id) on delete set null,
  title text not null,
  service_type text,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  location text,
  estimated_value numeric(12,2) not null default 0,
  actual_value numeric(12,2),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid', 'refunded', 'not_applicable')),
  status text not null default 'scheduled' check (status in ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  assigned_to uuid references auth.users(id) on delete set null,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## tasks

```sql
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  related_type text not null default 'general' check (related_type in ('lead', 'job', 'client', 'general')),
  related_id uuid,
  title text not null,
  description text,
  due_at timestamptz,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'cancelled')),
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Important:

Do not store `overdue` as a permanent task status. Calculate overdue dynamically:

```sql
due_at < now() and status != 'done'
```

## appointments

```sql
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes text,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

# 9. Logs and Templates

## message_templates

```sql
create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  template_type text not null default 'general',
  channel text not null default 'email' check (channel in ('email', 'sms', 'internal')),
  subject text,
  body text not null,
  variables jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## automation_logs

```sql
create table public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  automation_type text not null,
  related_type text not null default 'general',
  related_id uuid,
  status text not null default 'pending' check (status in ('success', 'failed', 'pending', 'skipped', 'retrying')),
  message text not null,
  payload jsonb,
  error_message text,
  created_at timestamptz not null default now()
);
```

## audit_logs

```sql
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);
```

---

# 10. RLS Policy Pattern

Enable RLS on all workspace-owned tables.

```sql
alter table public.clients enable row level security;
```

Read policy:

```sql
create policy "Workspace members can read clients"
on public.clients
for select
to authenticated
using (public.is_workspace_member(workspace_id));
```

Insert policy:

```sql
create policy "Workspace members can insert clients"
on public.clients
for insert
to authenticated
with check (public.is_workspace_member(workspace_id));
```

Update policy:

```sql
create policy "Workspace members can update clients"
on public.clients
for update
to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));
```

Delete policy:

```sql
create policy "Workspace admins can delete clients"
on public.clients
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));
```

Apply similar policies to:

```text
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

For sensitive settings, restrict write operations to:

```text
owner
admin
```

---

# 11. Indexes

```sql
create index idx_workspace_members_user_id on public.workspace_members(user_id);
create index idx_workspace_members_workspace_id on public.workspace_members(workspace_id);

create index idx_clients_workspace_id on public.clients(workspace_id);

create index idx_leads_workspace_id on public.leads(workspace_id);
create index idx_leads_stage_id on public.leads(stage_id);
create index idx_leads_created_at on public.leads(created_at desc);
create index idx_leads_next_follow_up_at on public.leads(next_follow_up_at);
create index idx_leads_assigned_to on public.leads(assigned_to);

create index idx_jobs_workspace_id on public.jobs(workspace_id);
create index idx_jobs_stage_id on public.jobs(stage_id);
create index idx_jobs_scheduled_start on public.jobs(scheduled_start);
create index idx_jobs_assigned_to on public.jobs(assigned_to);

create index idx_tasks_workspace_id on public.tasks(workspace_id);
create index idx_tasks_due_at on public.tasks(due_at);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_assigned_to on public.tasks(assigned_to);

create index idx_appointments_workspace_id on public.appointments(workspace_id);
create index idx_appointments_starts_at on public.appointments(starts_at);

create index idx_automation_logs_workspace_created on public.automation_logs(workspace_id, created_at desc);
create index idx_audit_logs_workspace_created on public.audit_logs(workspace_id, created_at desc);
```

---

# 12. Dashboard Query Requirements

The database must support:

## KPI Cards

- New leads this month
- Jobs booked this month
- Estimated revenue this month
- Overdue tasks

## Today Agenda

- Appointments where `starts_at` is today
- Jobs where `scheduled_start` is today

## Pipeline Overview

- Lead count per stage
- Job count per stage

## Task Overview

- Total tasks
- Completed tasks
- Pending tasks
- Overdue tasks calculated dynamically

## Recent Activity

- Latest automation logs
- Latest audit logs

---

# 13. Development Seed Data

Seed data is allowed only in local development.

Recommended dev workspace:

```text
Acme Cleaning Co.
```

Default lead stages:

```text
New
Contacted
Quote Sent
Booked
Completed
Lost
```

Default job stages:

```text
Scheduled
In Progress
Completed
Paid
Cancelled
```

Default message templates:

```text
New Lead Follow-up
Appointment Reminder
Job Completion Follow-up
Review Request
```

Do not seed production data.

---

# 14. Type Generation

After migrations are applied, generate types:

```bash
supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" --schema public > src/types/database.generated.ts
```

Codex must not manually invent database types if generated types are available.

---

# 15. Definition of Done

The DB foundation is done when:

- All MVP tables exist
- RLS is enabled on workspace-owned tables
- Helper functions work
- User can only access workspace data
- Indexes exist
- Dashboard queries are supported
- Generated TypeScript types are possible
- No service role key is used in frontend
