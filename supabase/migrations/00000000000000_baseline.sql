-- Baseline schema for the local supabase instance.
--
-- Reconstructed from the app code (src/lib/supabase.ts Database type and the
-- API routes) because the hosted schema lives only in the dashboard. Once the
-- repo is linked to the hosted dev project, replace this file with the real
-- export: `supabase link --project-ref <dev-ref> && supabase db pull`.

create table public.users (
  id uuid primary key,
  privy_user_id text not null unique,
  wallet_address text,
  created_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  username text,
  updated_at timestamptz not null default now()
);

-- id is the raw on-chain circle id (fresh local deployments restart at 0,
-- which is why local mode never shares the hosted instance).
create table public.stacks_metadata (
  id text primary key,
  stackname text not null,
  created_at timestamptz not null default now(),
  expected_members integer not null,
  invite_links jsonb not null default '[]'::jsonb
);

create table public.user_stacks (
  user_id uuid not null references public.users (id) on delete cascade,
  stack_id text not null references public.stacks_metadata (id) on delete cascade,
  primary key (user_id, stack_id)
);
