# Supabase & data privacy

App-Stacks uses Supabase (Postgres) for the **off-chain** metadata that doesn't belong
on-chain — stack names, invite links, and user profiles. The on-chain Saving Circles
contracts remain the source of truth for membership, deposits, and funds.

The core privacy requirement: **non-members of a circle must not be able to read that
circle's private information.** This is enforced by Postgres **Row Level Security (RLS)**,
not by the frontend. Treat RLS as a security boundary, not a convenience.

> The actual SQL — table definitions and RLS policies — lives in
> [`supabase/migrations/`](../supabase/migrations/) and is applied per environment with the
> Supabase CLI (see [`supabase/README.md`](../supabase/README.md)). This document describes
> how the application code uses Supabase and the rules code must respect. If you change a
> table's shape, add a migration **and** mirror it in the `Database` type in
> [`src/lib/supabase.ts`](../src/lib/supabase.ts).

## Two ways the app talks to Supabase

There are two distinct clients, and the difference is a security boundary — never mix them:

| Client                   | Key                             | Where it runs                         | RLS          |
| ------------------------ | ------------------------------- | ------------------------------------- | ------------ |
| **Anon (user)**          | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser (`"use client"`)              | **Enforced** |
| **Service role (admin)** | `SUPABASE_SERVICE_ROLE_KEY`     | Server only — `src/app/api/**` routes | **Bypassed** |

- **Anon client** — `createSupabaseClient()` in `src/lib/supabase.ts`. Runs in the
  browser, authenticated as the logged-in user, and is subject to RLS. This is what most
  reads should go through, so the database itself enforces who can see what.
- **Service-role client** — created with `SUPABASE_SERVICE_ROLE_KEY` inside API route
  handlers (e.g. `src/app/api/user/route.ts`, `api/onboard`). It **bypasses RLS**, so it
  may only run on the server and must apply its own authorization checks before reading or
  writing on a user's behalf.

**Rules:**

- The service-role key must **never** be imported into a `"use client"` file or exposed to
  the browser. It lives only in `serverEnv` (`src/lib/envs/server.ts`) and is used only in
  `src/app/api/**`.
- Prefer the anon client + RLS for user-facing reads. Reach for the service role only when
  RLS genuinely can't express the operation, and add explicit checks when you do.

## Authentication flow

Auth identity comes from **Privy**, bridged into Supabase:

1. The user logs in with Privy (which also provisions an embedded wallet).
2. `signInWithPrivyToken()` exchanges the Privy access token for a Supabase session
   (`auth.signInWithIdToken({ provider: "privy", token })`), so the Supabase session
   identifies the same user. RLS policies key off this identity.
3. On first login, `onboardSupabaseUser()` (`src/lib/onboarding/supabase.ts`) calls the
   `POST /api/onboard` route, which uses the service-role client to create the user's
   `users` record.

The `SupabaseProvider` (`src/components/providers/supabase.tsx`) wires this session into
the React tree; components access Supabase through it.

## Tables (as typed in `src/lib/supabase.ts`)

The `Database` type is the contract between the app and Postgres. Current tables:

- **`users`** — `id`, `privy_user_id`, `wallet_address`, `created_at`. Links a Privy
  account to an app user. Created during onboarding via the service role.
- **`profiles`** — `user_id`, `username`, `updated_at`. Public-ish display info for a user.
- **`stacks_metadata`** — `id`, `stackname`, `created_at`, `expected_members`,
  `invite_links` (`{ short, long, used }[]`). Off-chain metadata for a circle; the
  `invite_links` array carries the shareable join links and their used state.

Helper queries live alongside the client in `src/lib/supabase.ts`
(`getStacksMetadata`, `getProfile`, …).

## When you touch Supabase

- **Schema change?** Update the table in the Supabase project **and** the `Database` type
  in `src/lib/supabase.ts` so TypeScript stays accurate.
- **New read/write on behalf of a user?** Default to the anon client so RLS applies. If you
  must use the service role, do it in an API route and authorize the caller explicitly.
- **Privacy-sensitive data?** Confirm an RLS policy restricts it to circle members before
  relying on it. Do not move private reads to the service role just to "make it work" — that
  silently bypasses the privacy guarantee. If you think you need to, stop and flag it.
- **New env var?** Add it to the relevant Zod schema (`env.ts` for client,
  `envs/server.ts` for server) and to `.env.local.example`.
