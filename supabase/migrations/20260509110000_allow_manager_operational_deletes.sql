drop policy if exists "Workspace admins can delete leads"
on public.leads;

create policy "Workspace admins and managers can delete leads"
on public.leads
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager']));

drop policy if exists "Workspace admins can delete jobs"
on public.jobs;

create policy "Workspace admins and managers can delete jobs"
on public.jobs
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager']));

drop policy if exists "Workspace admins can delete tasks"
on public.tasks;

create policy "Workspace admins and managers can delete tasks"
on public.tasks
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager']));

drop policy if exists "Workspace admins can delete appointments"
on public.appointments;

create policy "Workspace admins and managers can delete appointments"
on public.appointments
for delete
to authenticated
using (public.has_workspace_role(workspace_id, array['owner', 'admin', 'manager']));
