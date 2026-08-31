-- Tracks whether a legacy embedded-wallet user has migrated their on-chain
-- stack memberships to a linked external wallet (via the contract's
-- migrateMember), so the "Migrate my old stacks" banner stops showing once
-- they've done it. Same posture as transferred_to_wallet_at: public read,
-- writes only via the service role (src/app/api/user).
alter table public.users
  add column if not exists migrated_stacks_at timestamptz;
