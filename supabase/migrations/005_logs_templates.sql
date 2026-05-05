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

create trigger set_message_templates_updated_at
before update on public.message_templates
for each row
execute function public.handle_updated_at();

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
