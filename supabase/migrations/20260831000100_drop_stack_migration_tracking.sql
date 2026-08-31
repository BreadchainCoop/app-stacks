-- Product decision: legacy embedded-wallet users' previous stacks and
-- activity are no longer preserved/migrated across the address split — only
-- moving leftover funds (BREAD/xDAI) to the linked wallet is still supported.
-- Drops the two columns that tracked stack-membership migration specifically;
-- transferred_to_wallet_at (funds) is untouched.
alter table public.users
  drop column if exists migrated_stacks_at,
  drop column if exists last_migration_result;
