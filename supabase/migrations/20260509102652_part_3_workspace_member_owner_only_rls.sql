drop policy if exists "Workspace admins can insert memberships"
on public.workspace_members;

drop policy if exists "Workspace admins can update memberships"
on public.workspace_members;

drop policy if exists "Workspace admins can delete memberships"
on public.workspace_members;

create policy "Workspace owners can insert memberships"
on public.workspace_members
for insert
to authenticated
with check (
  public.has_workspace_role(workspace_id, array['owner'])
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

create policy "Workspace owners can update memberships"
on public.workspace_members
for update
to authenticated
using (public.has_workspace_role(workspace_id, array['owner']))
with check (public.has_workspace_role(workspace_id, array['owner']));

create policy "Workspace owners can delete memberships"
on public.workspace_members
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner']));
