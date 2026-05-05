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

create trigger set_workspace_branding_updated_at
before update on public.workspace_branding
for each row
execute function public.handle_updated_at();

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

create trigger set_workspace_modules_updated_at
before update on public.workspace_modules
for each row
execute function public.handle_updated_at();

create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  entity_type text not null check (entity_type in ('lead', 'job')),
  name text not null,
  color text not null default '#6D5DFC',
  order_index integer not null default 0,
  is_closed boolean not null default false,
  is_won boolean not null default false,
  is_lost boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, entity_type, name)
);

create trigger set_pipeline_stages_updated_at
before update on public.pipeline_stages
for each row
execute function public.handle_updated_at();
