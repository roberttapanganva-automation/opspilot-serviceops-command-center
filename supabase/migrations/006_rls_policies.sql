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

create or replace function public.has_workspace_role(
  target_workspace_id uuid,
  allowed_roles text[]
)
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

revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.has_workspace_role(uuid, text[]) from public;

grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.has_workspace_role(uuid, text[]) to authenticated;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_branding enable row level security;
alter table public.workspace_modules enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.clients enable row level security;
alter table public.leads enable row level security;
alter table public.jobs enable row level security;
alter table public.tasks enable row level security;
alter table public.appointments enable row level security;
alter table public.message_templates enable row level security;
alter table public.automation_logs enable row level security;
alter table public.audit_logs enable row level security;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Workspace owners can create workspaces"
on public.workspaces
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Workspace members can read workspaces"
on public.workspaces
for select
to authenticated
using (
  owner_id = auth.uid()
  or public.is_workspace_member(id)
);

create policy "Workspace admins can update workspaces"
on public.workspaces
for update
to authenticated
using (public.has_workspace_role(id, array['owner', 'admin']))
with check (public.has_workspace_role(id, array['owner', 'admin']));

create policy "Workspace owners can delete workspaces"
on public.workspaces
for delete
to authenticated
using (owner_id = auth.uid());

create policy "Workspace members can read memberships"
on public.workspace_members
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace admins can insert memberships"
on public.workspace_members
for insert
to authenticated
with check (
  public.has_workspace_role(workspace_id, array['owner', 'admin'])
  or (
    user_id = auth.uid()
    and role = 'owner'
    and status = 'active'
    and exists (
      select 1
      from public.workspaces w
      where w.id = workspace_id
        and w.owner_id = auth.uid()
    )
  )
);

create policy "Workspace admins can update memberships"
on public.workspace_members
for update
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace admins can delete memberships"
on public.workspace_members
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace members can read workspace branding"
on public.workspace_branding
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace admins can insert workspace branding"
on public.workspace_branding
for insert
to authenticated
with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace admins can update workspace branding"
on public.workspace_branding
for update
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace admins can delete workspace branding"
on public.workspace_branding
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace members can read workspace modules"
on public.workspace_modules
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace admins can insert workspace modules"
on public.workspace_modules
for insert
to authenticated
with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace admins can update workspace modules"
on public.workspace_modules
for update
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace admins can delete workspace modules"
on public.workspace_modules
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace members can read pipeline stages"
on public.pipeline_stages
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace admins can insert pipeline stages"
on public.pipeline_stages
for insert
to authenticated
with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace admins can update pipeline stages"
on public.pipeline_stages
for update
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace admins can delete pipeline stages"
on public.pipeline_stages
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace members can read clients"
on public.clients
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace members can insert clients"
on public.clients
for insert
to authenticated
with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can update clients"
on public.clients
for update
to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "Workspace admins can delete clients"
on public.clients
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace members can read leads"
on public.leads
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace members can insert leads"
on public.leads
for insert
to authenticated
with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can update leads"
on public.leads
for update
to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "Workspace admins can delete leads"
on public.leads
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace members can read jobs"
on public.jobs
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace members can insert jobs"
on public.jobs
for insert
to authenticated
with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can update jobs"
on public.jobs
for update
to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "Workspace admins can delete jobs"
on public.jobs
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace members can read tasks"
on public.tasks
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace members can insert tasks"
on public.tasks
for insert
to authenticated
with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can update tasks"
on public.tasks
for update
to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "Workspace admins can delete tasks"
on public.tasks
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace members can read appointments"
on public.appointments
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace members can insert appointments"
on public.appointments
for insert
to authenticated
with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can update appointments"
on public.appointments
for update
to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "Workspace admins can delete appointments"
on public.appointments
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace members can read message templates"
on public.message_templates
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace admins can insert message templates"
on public.message_templates
for insert
to authenticated
with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace admins can update message templates"
on public.message_templates
for update
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']))
with check (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace admins can delete message templates"
on public.message_templates
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace members can read automation logs"
on public.automation_logs
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace members can insert automation logs"
on public.automation_logs
for insert
to authenticated
with check (public.is_workspace_member(workspace_id));

create policy "Workspace admins can delete automation logs"
on public.automation_logs
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));

create policy "Workspace members can read audit logs"
on public.audit_logs
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "Workspace members can insert audit logs"
on public.audit_logs
for insert
to authenticated
with check (public.is_workspace_member(workspace_id));

create policy "Workspace admins can delete audit logs"
on public.audit_logs
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin']));
