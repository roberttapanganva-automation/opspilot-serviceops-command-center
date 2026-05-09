alter table public.profiles
add column if not exists theme_mode text not null default 'system';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%theme_mode%'
      and pg_get_constraintdef(oid) ilike '%system%'
      and pg_get_constraintdef(oid) ilike '%light%'
      and pg_get_constraintdef(oid) ilike '%dark%'
  ) then
    alter table public.profiles
    add constraint profiles_theme_mode_valid
    check (theme_mode in ('system', 'light', 'dark'));
  end if;
end $$;

grant select, insert, update on public.profiles to authenticated;

drop policy if exists "Users can read own profile"
on public.profiles;

drop policy if exists "Users can insert own profile"
on public.profiles;

drop policy if exists "Users can update own profile"
on public.profiles;

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
