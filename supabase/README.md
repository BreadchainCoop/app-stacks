# Supabase migrations

Schema changes live in `migrations/` as ordered SQL files and are applied
with the Supabase CLI. The CLI records which migrations each project has
run, so pushing twice is safe and every environment converges on the same
schema.

## One-time setup

```bash
# Install the CLI (or: brew install supabase/tap/supabase)
pnpm dlx supabase --version

supabase login
```

## Applying migrations to an environment

Gnosis and Celo are separate deployments (see docs/ARCHITECTURE.md), each with
its own Supabase project per tier — six projects total: local, local-celo,
development, development-celo, prod, prod-celo. (The former "demo" project has
been retired.) Put each project's database URL in `.env.local` (see
`.env.local.example`; Dashboard -> Settings -> Database -> Connection string),
then:

```bash
pnpm db:push:local
pnpm db:push:development
pnpm db:push:prod
```

The `-celo` projects don't have dedicated `pnpm` scripts yet — push them with
the equivalent manual flow: `supabase link --project-ref <ref> && supabase db
push`, or add `SUPABASE_DB_URL_*_CELO` vars and matching `db:push:*-celo`
scripts to `package.json` if these become routine enough to script.

`db push` runs only the migrations that project hasn't seen yet, in filename
order. Push each environment after a schema change lands on the branch it
deploys from.

## Adding a new migration

```bash
pnpm db:migration <short_name>
# -> creates migrations/<timestamp>_<short_name>.sql; write your SQL there
```

Guidelines:

- Write statements idempotently (`if not exists` / `drop ... if exists`)
  where cheap - it makes recovery from partial failures painless.
- Never edit an already-pushed migration; add a new one instead.
- Schema change = also update the `Database` type in `src/lib/supabase.ts`
  (see docs/SUPABASE.md).

## History notes

- The files in [`history/`](./history/) are the pre-migration history of
  ad-hoc SQL run per environment (newest entry first). They are records, not
  runnable scripts - several entries are non-idempotent or superseded by
  later entries. The two initial migrations capture their end state.
- `20260705000100_baseline_schema.sql` is written so it applies cleanly to
  the existing projects (everything guarded) as well as to a fresh one.
- Production additionally has a delete-prevention trigger on
  `stacks_metadata` (`tr_no_delete_stacks_metadata`) that is deliberately
  not in migrations: it was dropped in development to allow test cleanup.
  If that split stops being useful, promote it into a migration.
