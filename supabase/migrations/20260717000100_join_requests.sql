-- General invite link: off-chain ledger of requests to join a stack,
-- reviewed by the stack owner before an on-chain invite is issued. Carries
-- other users' wallet addresses and pending activity, which is more
-- sensitive than the public stacks_metadata rows, so unlike that table this
-- one has no anon/authenticated grants at all — every read and write goes
-- through the service-role API route (src/app/api/stacks/join-requests).

create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  stack_id text not null references public.stacks_metadata(id),
  user_id uuid not null references public.users(id) on delete cascade,
  wallet_address text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  invite_link jsonb,
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (stack_id, user_id)
);

alter table public.join_requests enable row level security;

revoke all on public.join_requests from anon, authenticated;
