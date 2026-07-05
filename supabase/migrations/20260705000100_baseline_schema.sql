-- Baseline: snapshot of the schema all environments share, written
-- idempotently so it applies cleanly both to fresh projects and to the
-- existing environments (which reached this state via ad-hoc SQL - see
-- *.supa.txt history files).

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists citext;

-- Tables
create table if not exists public.users (
  id uuid primary key,
  privy_user_id text not null unique,
  wallet_address text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  username citext unique,
  updated_at timestamptz not null default now()
);

create table if not exists public.stacks_metadata (
  id text primary key,
  stackname text not null,
  expected_members int4 not null default 0,
  invite_links jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists public.user_stacks (
  user_id uuid references public.users(id) on delete cascade,
  stack_id text references public.stacks_metadata(id),
  joined_at timestamptz not null default now(),
  automatic_claims boolean not null default false,
  primary key (user_id, stack_id)
);

-- Columns added after the original tables shipped
alter table public.stacks_metadata
  add column if not exists expected_members int4 not null default 0,
  add column if not exists invite_links jsonb not null default '[]';

alter table public.user_stacks
  add column if not exists automatic_claims boolean not null default false;

-- Row Level Security on everything; write access for clients is granted
-- per-table below (server API routes use the service role and bypass RLS)
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.stacks_metadata enable row level security;
alter table public.user_stacks enable row level security;

-- stacks_metadata: public read, no client writes
drop policy if exists "stacks_select_all" on public.stacks_metadata;
create policy "stacks_select_all" on public.stacks_metadata
  for select to anon, authenticated using (true);

drop policy if exists "stacks_insert_all" on public.stacks_metadata;
drop policy if exists "stacks_update_all" on public.stacks_metadata;
drop policy if exists "stacks_delete_all" on public.stacks_metadata;

grant select on public.stacks_metadata to anon, authenticated;
revoke insert, update, delete on public.stacks_metadata from anon, authenticated;

-- stacks_metadata: id / created_at are immutable
create or replace function public.prevent_stacks_metadata_immutable_fields()
returns trigger language plpgsql as $$
begin
  if NEW.id <> OLD.id then
    raise exception 'stacks_metadata.id is immutable';
  end if;
  if NEW.created_at <> OLD.created_at then
    raise exception 'stacks_metadata.created_at is immutable';
  end if;
  return NEW;
end;
$$;

drop trigger if exists tr_protect_stacks_metadata_fields on public.stacks_metadata;
create trigger tr_protect_stacks_metadata_fields
  before update on public.stacks_metadata
  for each row execute function public.prevent_stacks_metadata_immutable_fields();

-- user_stacks: public read, no client writes
drop policy if exists "user_stacks_select_all" on public.user_stacks;
drop policy if exists "user_stacks_select_own" on public.user_stacks;
create policy "user_stacks_select_all" on public.user_stacks
  for select to anon, authenticated using (true);

drop policy if exists "user_stacks_insert_all" on public.user_stacks;
drop policy if exists "user_stacks_delete_all" on public.user_stacks;
drop policy if exists "user_stack_select_own" on public.user_stacks;
drop policy if exists "user_stack_insert_own" on public.user_stacks;
drop policy if exists "user_stack_update_own" on public.user_stacks;

grant select on public.user_stacks to anon, authenticated;
revoke insert, update, delete on public.user_stacks from anon, authenticated;
