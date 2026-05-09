grant select, insert, update on public.profiles to authenticated;

create policy "Workspace leaders can read member profiles"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members viewer_member
    join public.workspace_members target_member
      on target_member.workspace_id = viewer_member.workspace_id
    where viewer_member.user_id = auth.uid()
      and viewer_member.status = 'active'
      and viewer_member.role in ('owner', 'admin', 'manager')
      and target_member.user_id = profiles.id
      and target_member.status = 'active'
  )
);
