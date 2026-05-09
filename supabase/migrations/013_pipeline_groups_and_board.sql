create table if not exists public.pipeline_groups (
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

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_pipeline_groups_updated_at'
  ) then
    create trigger set_pipeline_groups_updated_at
    before update on public.pipeline_groups
    for each row execute function public.handle_updated_at();
  end if;
end $$;

alter table public.pipeline_stages
add column if not exists pipeline_group_id uuid references public.pipeline_groups(id) on delete cascade;

insert into public.pipeline_groups (
  workspace_id,
  name,
  description,
  entity_type,
  order_index,
  is_default
)
select distinct
  stage.workspace_id,
  case
    when stage.entity_type = 'lead' then 'Sales Pipeline'
    else 'Client Delivery Pipeline'
  end,
  null,
  stage.entity_type,
  0,
  true
from public.pipeline_stages stage
where stage.pipeline_group_id is null
on conflict (workspace_id, entity_type, name) do nothing;

update public.pipeline_stages stage
set pipeline_group_id = groups.id
from public.pipeline_groups groups
where stage.pipeline_group_id is null
  and stage.workspace_id = groups.workspace_id
  and stage.entity_type = groups.entity_type
  and groups.is_default = true;

alter table public.pipeline_stages
alter column pipeline_group_id set not null;

alter table public.pipeline_groups enable row level security;

create policy "Workspace members can read pipeline groups"
on public.pipeline_groups
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace owners can insert pipeline groups"
on public.pipeline_groups
for insert
to authenticated
with check (public.has_workspace_role(workspace_id, array['owner']));

create policy "Workspace owners can update pipeline groups"
on public.pipeline_groups
for update
to authenticated
using (public.has_workspace_role(workspace_id, array['owner']))
with check (public.has_workspace_role(workspace_id, array['owner']));

create policy "Workspace owners can delete pipeline groups"
on public.pipeline_groups
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner']));

create index if not exists idx_pipeline_groups_workspace_id
on public.pipeline_groups (workspace_id);

create index if not exists idx_pipeline_groups_entity_type
on public.pipeline_groups (entity_type);

create index if not exists idx_pipeline_groups_workspace_entity_order
on public.pipeline_groups (workspace_id, entity_type, order_index);

create unique index if not exists idx_pipeline_groups_default_per_entity
on public.pipeline_groups (workspace_id, entity_type)
where is_default = true;

create index if not exists idx_pipeline_stages_pipeline_group_id
on public.pipeline_stages (pipeline_group_id);

grant select, insert, update, delete on public.pipeline_groups to authenticated;
