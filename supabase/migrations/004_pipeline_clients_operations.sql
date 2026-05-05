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

create trigger set_clients_updated_at
before update on public.clients
for each row
execute function public.handle_updated_at();

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

create trigger set_leads_updated_at
before update on public.leads
for each row
execute function public.handle_updated_at();

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

create trigger set_jobs_updated_at
before update on public.jobs
for each row
execute function public.handle_updated_at();

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

create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.handle_updated_at();

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

create trigger set_appointments_updated_at
before update on public.appointments
for each row
execute function public.handle_updated_at();
