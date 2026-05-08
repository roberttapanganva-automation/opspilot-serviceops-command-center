create policy "Invited users can read their own invitations"
on public.workspace_invitations
for select
to authenticated
using (
  lower(invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create or replace function public.accept_workspace_invitation(target_invitation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_user_email text := auth.jwt() ->> 'email';
  invitation_record public.workspace_invitations%rowtype;
  accepted_member public.workspace_members%rowtype;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if current_user_email is null or btrim(current_user_email) = '' then
    raise exception 'not_authenticated';
  end if;

  select *
  into invitation_record
  from public.workspace_invitations
  where id = target_invitation_id
  for update;

  if not found then
    raise exception 'invalid_invitation';
  end if;

  if lower(invitation_record.invited_email) <> lower(current_user_email) then
    raise exception 'email_mismatch';
  end if;

  if invitation_record.status = 'accepted' then
    raise exception 'invitation_already_accepted';
  end if;

  if invitation_record.status <> 'pending' then
    raise exception 'invitation_not_pending';
  end if;

  if invitation_record.expires_at is not null and invitation_record.expires_at < now() then
    update public.workspace_invitations
    set status = 'expired',
        updated_at = now()
    where id = invitation_record.id;

    raise exception 'invitation_expired';
  end if;

  if invitation_record.role not in ('admin', 'manager', 'staff', 'viewer') then
    raise exception 'invalid_invitation';
  end if;

  insert into public.workspace_members (
    workspace_id,
    user_id,
    role,
    status,
    invited_email,
    invited_by,
    accepted_at
  )
  values (
    invitation_record.workspace_id,
    current_user_id,
    invitation_record.role,
    'active',
    invitation_record.invited_email,
    invitation_record.invited_by,
    now()
  )
  on conflict (workspace_id, user_id) do update
  set role = case
      when public.workspace_members.role = 'owner' then public.workspace_members.role
      else excluded.role
    end,
    status = 'active',
    invited_email = excluded.invited_email,
    invited_by = excluded.invited_by,
    accepted_at = coalesce(public.workspace_members.accepted_at, now()),
    updated_at = now()
  returning *
  into accepted_member;

  update public.workspace_invitations
  set status = 'accepted',
      accepted_by = current_user_id,
      accepted_at = now(),
      updated_at = now()
  where id = invitation_record.id;

  insert into public.audit_logs (
    workspace_id,
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    invitation_record.workspace_id,
    current_user_id,
    'workspace.invitation.accepted',
    'workspace_invitation',
    invitation_record.id,
    jsonb_build_object(
      'invited_email', invitation_record.invited_email,
      'role', invitation_record.role,
      'member_id', accepted_member.id
    )
  );

  return jsonb_build_object(
    'invitationId', invitation_record.id,
    'workspaceId', invitation_record.workspace_id,
    'role', invitation_record.role,
    'status', 'accepted'
  );
end;
$$;

revoke all on function public.accept_workspace_invitation(uuid) from public;
grant execute on function public.accept_workspace_invitation(uuid) to authenticated;
