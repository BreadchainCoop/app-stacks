-- Owner-direct join flow: visitors request to join off-chain, the owner
-- accepts via addMembers (no signature). Replaces the pooled invite-links
-- model entirely, so invite_links is dropped rather than kept for back-compat.
--
-- Drop-and-recreate rather than `if not exists`: an earlier, unrelated branch
-- shipped a differently-shaped join_requests table (requested_at/decided_at/
-- invite_link columns) to this same shared dev project, which `if not exists`
-- would silently leave in place. No production data depends on this table yet.
drop table if exists public.join_requests cascade;

create table public.join_requests (
  id uuid primary key default gen_random_uuid(),
  stack_id text not null references public.stacks_metadata(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  wallet_address text not null,
  status text not null default 'pending' check (status in ('pending', 'added', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (stack_id, wallet_address)
);

create index if not exists join_requests_stack_status_idx
  on public.join_requests (stack_id, status);

-- Fully private: a requester's wallet/identity shouldn't be visible to
-- non-owners, so unlike stacks_metadata this has no anon/authenticated
-- grants at all — every read and write goes through the service-role API
-- route (src/app/api/stacks/join-request).
alter table public.join_requests enable row level security;
revoke all on public.join_requests from anon, authenticated;

alter table public.stacks_metadata drop column if exists invite_links;
