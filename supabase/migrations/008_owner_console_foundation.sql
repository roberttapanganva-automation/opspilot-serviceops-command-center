alter table public.profiles
add column if not exists last_seen_at timestamptz;

create table if not exists public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  invited_email text not null,
  role text not null check (role in ('admin', 'manager', 'staff', 'viewer')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'cancelled', 'expired')),
  invited_by uuid references auth.users(id) on delete set null,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_workspace_invitations_pending_email
on public.workspace_invitations (workspace_id, lower(invited_email))
where status = 'pending';

create table if not exists public.workspace_role_permissions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  role text not null check (role in ('admin', 'manager', 'staff', 'viewer')),
  can_view_settings boolean not null default true,
  can_edit_basic_settings boolean not null default false,
  can_edit_branding boolean not null default false,
  can_manage_modules boolean not null default false,
  can_manage_pipeline boolean not null default false,
  can_create_leads boolean not null default true,
  can_create_jobs boolean not null default true,
  can_create_tasks boolean not null default true,
  can_create_appointments boolean not null default true,
  can_view_audit_logs boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, role)
);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'workspace_invitations_updated_at'
  ) then
    create trigger workspace_invitations_updated_at
    before update on public.workspace_invitations
    for each row execute function public.handle_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'workspace_role_permissions_updated_at'
  ) then
    create trigger workspace_role_permissions_updated_at
    before update on public.workspace_role_permissions
    for each row execute function public.handle_updated_at();
  end if;
end $$;

alter table public.workspace_invitations enable row level security;
alter table public.workspace_role_permissions enable row level security;

create policy "Workspace owners can read invitations"
on public.workspace_invitations
for select
to authenticated
using (public.has_workspace_role(workspace_id, array['owner']));

create policy "Workspace owners can insert invitations"
on public.workspace_invitations
for insert
to authenticated
with check (public.has_workspace_role(workspace_id, array['owner']));

create policy "Workspace owners can update invitations"
on public.workspace_invitations
for update
to authenticated
using (public.has_workspace_role(workspace_id, array['owner']))
with check (public.has_workspace_role(workspace_id, array['owner']));

create policy "Workspace owners can delete invitations"
on public.workspace_invitations
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner']));

create policy "Workspace owners can read role permissions"
on public.workspace_role_permissions
for select
to authenticated
using (public.has_workspace_role(workspace_id, array['owner']));

create policy "Workspace members can read their role permissions"
on public.workspace_role_permissions
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace_role_permissions.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wm.role = workspace_role_permissions.role
  )
);

create policy "Role permissions can update workspace profile"
on public.workspaces
for update
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    join public.workspace_role_permissions wrp
      on wrp.workspace_id = wm.workspace_id
     and wrp.role = wm.role
    where wm.workspace_id = workspaces.id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wrp.can_edit_basic_settings
  )
)
with check (
  exists (
    select 1
    from public.workspace_members wm
    join public.workspace_role_permissions wrp
      on wrp.workspace_id = wm.workspace_id
     and wrp.role = wm.role
    where wm.workspace_id = workspaces.id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wrp.can_edit_basic_settings
  )
);

create policy "Role permissions can insert workspace branding"
on public.workspace_branding
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workspace_members wm
    join public.workspace_role_permissions wrp
      on wrp.workspace_id = wm.workspace_id
     and wrp.role = wm.role
    where wm.workspace_id = workspace_branding.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wrp.can_edit_branding
  )
);

create policy "Role permissions can update workspace branding"
on public.workspace_branding
for update
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    join public.workspace_role_permissions wrp
      on wrp.workspace_id = wm.workspace_id
     and wrp.role = wm.role
    where wm.workspace_id = workspace_branding.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wrp.can_edit_branding
  )
)
with check (
  exists (
    select 1
    from public.workspace_members wm
    join public.workspace_role_permissions wrp
      on wrp.workspace_id = wm.workspace_id
     and wrp.role = wm.role
    where wm.workspace_id = workspace_branding.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wrp.can_edit_branding
  )
);

create policy "Role permissions can insert workspace modules"
on public.workspace_modules
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workspace_members wm
    join public.workspace_role_permissions wrp
      on wrp.workspace_id = wm.workspace_id
     and wrp.role = wm.role
    where wm.workspace_id = workspace_modules.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wrp.can_manage_modules
  )
);

create policy "Role permissions can update workspace modules"
on public.workspace_modules
for update
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    join public.workspace_role_permissions wrp
      on wrp.workspace_id = wm.workspace_id
     and wrp.role = wm.role
    where wm.workspace_id = workspace_modules.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wrp.can_manage_modules
  )
)
with check (
  exists (
    select 1
    from public.workspace_members wm
    join public.workspace_role_permissions wrp
      on wrp.workspace_id = wm.workspace_id
     and wrp.role = wm.role
    where wm.workspace_id = workspace_modules.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wrp.can_manage_modules
  )
);

create policy "Role permissions can insert pipeline stages"
on public.pipeline_stages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workspace_members wm
    join public.workspace_role_permissions wrp
      on wrp.workspace_id = wm.workspace_id
     and wrp.role = wm.role
    where wm.workspace_id = pipeline_stages.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wrp.can_manage_pipeline
  )
);

create policy "Role permissions can update pipeline stages"
on public.pipeline_stages
for update
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    join public.workspace_role_permissions wrp
      on wrp.workspace_id = wm.workspace_id
     and wrp.role = wm.role
    where wm.workspace_id = pipeline_stages.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wrp.can_manage_pipeline
  )
)
with check (
  exists (
    select 1
    from public.workspace_members wm
    join public.workspace_role_permissions wrp
      on wrp.workspace_id = wm.workspace_id
     and wrp.role = wm.role
    where wm.workspace_id = pipeline_stages.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wrp.can_manage_pipeline
  )
);

create policy "Role permissions can delete pipeline stages"
on public.pipeline_stages
for delete
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    join public.workspace_role_permissions wrp
      on wrp.workspace_id = wm.workspace_id
     and wrp.role = wm.role
    where wm.workspace_id = pipeline_stages.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wrp.can_manage_pipeline
  )
);

create policy "Workspace owners can insert role permissions"
on public.workspace_role_permissions
for insert
to authenticated
with check (public.has_workspace_role(workspace_id, array['owner']));

create policy "Workspace owners can update role permissions"
on public.workspace_role_permissions
for update
to authenticated
using (public.has_workspace_role(workspace_id, array['owner']))
with check (public.has_workspace_role(workspace_id, array['owner']));

create policy "Workspace owners can delete role permissions"
on public.workspace_role_permissions
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner']));

create index if not exists idx_workspace_invitations_workspace_id
on public.workspace_invitations (workspace_id);

create index if not exists idx_workspace_invitations_invited_email
on public.workspace_invitations (invited_email);

create index if not exists idx_workspace_invitations_status
on public.workspace_invitations (status);

create index if not exists idx_workspace_role_permissions_workspace_id
on public.workspace_role_permissions (workspace_id);

create index if not exists idx_workspace_role_permissions_role
on public.workspace_role_permissions (role);

grant select, insert, update, delete on public.workspace_invitations to authenticated;
grant select, insert, update, delete on public.workspace_role_permissions to authenticated;
