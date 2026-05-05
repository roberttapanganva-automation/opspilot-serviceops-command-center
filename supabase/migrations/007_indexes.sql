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
