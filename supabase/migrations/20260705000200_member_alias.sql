-- Member alias feature: aliases are publicly readable; writes go only
-- through POST /api/profile (service role), so clients get no write access.
-- Case-insensitive uniqueness comes from the existing citext unique
-- constraint on profiles.username.

-- Reads are public
grant select on public.users to anon, authenticated;
grant select on public.profiles to anon, authenticated;
revoke insert, update, delete on public.profiles from anon, authenticated;
revoke insert, update, delete on public.users from anon, authenticated;

-- Replace the dead auth.uid() own-row policies (the app has no Supabase
-- auth session; auth.uid() is always null, so these never matched)
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "users_delete_own" on public.users;

drop policy if exists "profiles readable" on public.profiles;
create policy "profiles readable" on public.profiles
  for select to anon, authenticated using (true);

drop policy if exists "users readable" on public.users;
create policy "users readable" on public.users
  for select to anon, authenticated using (true);

-- Redundant with the citext unique constraint (added during early testing)
drop index if exists public.profiles_username_lower_key;

-- Strict alias format replaces the old looser username_format_chk
-- (which allowed dots/hyphens and 3-24 chars)
update public.profiles
  set username = null
  where username is not null
    and username::text !~ '^[A-Za-z][A-Za-z0-9_]{2,19}$';

alter table public.profiles drop constraint if exists username_format_chk;
alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles
  add constraint profiles_username_format
  check (username is null or username::text ~ '^[A-Za-z][A-Za-z0-9_]{2,19}$');

alter table public.profiles drop constraint if exists profiles_username_reserved;
alter table public.profiles
  add constraint profiles_username_reserved
  check (username is null or lower(username::text) <> all (array[
    'admin','administrator','root','support','help','api','www','settings',
    'login','signup','system','moderator','mod','owner','staff','team',
    'official','bread','breadchain','stacks'
  ]));

-- Keep updated_at accurate automatically
alter table public.profiles alter column updated_at set default now();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();
