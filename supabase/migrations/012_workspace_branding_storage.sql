insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'workspace-branding',
  'workspace-branding',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read workspace branding assets"
on storage.objects;

drop policy if exists "Workspace owners can upload branding assets"
on storage.objects;

drop policy if exists "Workspace owners can update branding assets"
on storage.objects;

drop policy if exists "Workspace owners can delete branding assets"
on storage.objects;

create policy "Public can read workspace branding assets"
on storage.objects
for select
to public
using (bucket_id = 'workspace-branding');

create policy "Workspace owners can upload branding assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'workspace-branding'
  and array_length(storage.foldername(name), 1) >= 3
  and (storage.foldername(name))[2] in ('logo', 'icon')
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and public.has_workspace_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner']
  )
);

create policy "Workspace owners can update branding assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'workspace-branding'
  and array_length(storage.foldername(name), 1) >= 3
  and (storage.foldername(name))[2] in ('logo', 'icon')
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and public.has_workspace_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner']
  )
)
with check (
  bucket_id = 'workspace-branding'
  and array_length(storage.foldername(name), 1) >= 3
  and (storage.foldername(name))[2] in ('logo', 'icon')
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and public.has_workspace_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner']
  )
);

create policy "Workspace owners can delete branding assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'workspace-branding'
  and array_length(storage.foldername(name), 1) >= 3
  and (storage.foldername(name))[2] in ('logo', 'icon')
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and public.has_workspace_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner']
  )
);
