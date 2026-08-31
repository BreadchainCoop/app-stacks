-- Tracks the outcome of the most recent "Migrate everything" run so the UI
-- can tell a fully-clean migration apart from one where some parts (a
-- specific stack, its automation settings, or the funds transfer) failed and
-- still need retrying. Null means either never attempted or the last attempt
-- fully succeeded. Same posture as the other migration-tracking columns:
-- public read, writes only via the service role (src/app/api/user).
alter table public.users
  add column if not exists last_migration_result jsonb;
