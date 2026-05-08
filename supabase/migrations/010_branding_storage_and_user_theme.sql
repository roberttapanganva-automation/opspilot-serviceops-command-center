alter table public.profiles
add column if not exists theme_mode text not null default 'system'
check (theme_mode in ('system', 'light', 'dark'));

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
  and (storage.foldername(name))[2] in ('logo', 'icon')
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
  and public.has_workspace_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner']
  )
)
with check (
  bucket_id = 'workspace-branding'
  and (storage.foldername(name))[2] in ('logo', 'icon')
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
  and public.has_workspace_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner']
  )
);
