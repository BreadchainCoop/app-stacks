-- Tracks whether a user has moved funds from their embedded wallet to a
-- linked external wallet, so the "Transfer to your wallet" banner stops
-- showing once they've done it. Inherits users' existing RLS posture:
-- public read, writes only via the service role (src/app/api/user).
alter table public.users
  add column if not exists transferred_to_wallet_at timestamptz;
