# AGENTS.md

Canonical instructions for AI coding agents (Claude Code, Cursor, Copilot, Codex, etc.)
working in this repository. Human contributors: see [CONTRIBUTING.md](./CONTRIBUTING.md).

Claude Code also reads [CLAUDE.md](./CLAUDE.md), which holds the behavioral rules and
points back here for project context.

---

## What this project is

**App-Stacks** (a.k.a. Saving Circles) is a dApp for saving money together with friends
and family — a rotating savings circle ("stack"). Members deposit a fixed amount each
round, and one member claims the pooled funds per round until everyone has been paid.

On-chain logic lives in audited Solidity contracts (Saving Circles). The frontend reads
and writes those contracts and uses **Supabase** to store off-chain circle metadata
(stack name, invite links, profiles) so that **non-members of a circle cannot see private
information**. Privacy is enforced by Supabase Row Level Security — see
[docs/SUPABASE.md](./docs/SUPABASE.md).

## Tech stack

| Area            | Choice                                                    |
| --------------- | --------------------------------------------------------- |
| Framework       | Next.js 15 (App Router, Turbopack), React 19              |
| Language        | TypeScript (strict)                                       |
| Styling         | Tailwind CSS v4                                           |
| UI library      | `@breadcoop/ui` (Bread UI Kit) — primary component source |
| Auth / wallets  | Privy (embedded wallets) + wagmi + viem                   |
| Data fetching   | TanStack Query (via wagmi)                                |
| Off-chain data  | Supabase (Postgres + RLS)                                 |
| Server cache    | Upstash Redis                                             |
| Contracts       | Solidity + Foundry (git submodules under `contracts/`)    |
| Package manager | pnpm 11                                                   |

## Repository map

```
src/
  app/            Next.js App Router — routes, pages, API routes (src/app/api)
  components/     React components (Navbar, modal, providers, peer, lifi, icons, _home…)
  hooks/          One hook per concern; contract reads/writes wrap wagmi (use-*.ts)
  interfaces/     Shared TypeScript interfaces (circle, deposit-interval)
  lib/            Core: env parsing, supabase client/types, wagmi, abis/, constants, tokens
  utils/          Pure helpers (address, chain, time, shorten, paginate-logs…)
  constants/      Static data (links, solidarityTools)
contracts/        Foundry project; saving-circles is a git submodule (see .gitmodules)
docs/             ARCHITECTURE.md, SUPABASE.md
```

Read [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) before making structural changes.

**Understand the contracts first.** Before working on anything that reads or writes the
chain, read the Saving Circles contract source at
`contracts/lib/saving-circles/src/` (`contracts/` and `interfaces/` subfolders) — it
defines how the frontend is meant to interact with the contracts: the available functions,
their arguments, events, errors, and the circle lifecycle. The frontend ABIs in
`src/lib/abis/` must match that source. This is a git submodule; if the folder is empty,
run `make update-contract-submodules`. Read it, but do not edit it (see Guardrails).

## Setup & commands

This repo uses **pnpm**. Do not use npm or yarn.

```bash
pnpm install            # install deps
pnpm dev                # dev server on http://localhost:3001 (Turbopack)
pnpm build              # production build (also full type-check)
pnpm lint               # ESLint (next/core-web-vitals + typescript + prettier)
pnpm lint:fix           # ESLint with --fix
pnpm format             # Prettier write
pnpm format:check       # Prettier check
pnpm find-deadcode      # ts-prune: report unused exports
```

Local blockchain + contract deployment is driven by the `makefile` (`make anvil`,
`make start-local`, `make fund-wallet`, time-travel helpers, etc.). The full local setup
is documented in [README.md](./README.md) — consult it before touching contract or
deployment flows.

## Verification — how to check your work

This project has **no automated test suite**. Do not claim a change "passes tests."
Instead, the required gates before considering work done are:

1. `pnpm lint` — must be clean (no errors).
2. `pnpm build` — must succeed. This is also the type-check gate (`tsc` via Next).
3. `pnpm format:check` — formatting must be clean (or run `pnpm format`).
4. For anything user-visible, run `pnpm dev` and verify the behavior in the browser;
   describe what you checked.

If you add non-trivial logic, consider adding a test even though none exist yet, and say
so — but the three commands above are the baseline that must pass.

## Conventions (follow the existing code)

- **Files:** kebab-case (`use-circle-members.ts`, `get-user-circle-status.ts`). React
  component files may be PascalCase where the folder already does that (e.g. `Navbar/`).
- **Imports:** use the `@/*` alias for anything under `src/` (`@/lib/...`, `@/hooks/...`).
- **Hooks:** one concern per `use-*.ts`. Contract reads wrap `useReadContract` and pass
  `chainId: getDefaultChainId()` and `query.enabled` guards (see
  `src/hooks/use-circle-members.ts` as the template).
- **Env vars:** never read `process.env` directly in feature code. Client vars go through
  `clientEnv` in `src/lib/env.ts`; server-only vars through `serverEnv` in
  `src/lib/envs/server.ts`. Both are Zod-validated. Add new vars to the schema **and**
  `.env.local.example`.
- **Server vs client:** prefer React Server Components by default. Add `"use client"` only
  when a component actually needs it — hooks, state/effects, event handlers, browser APIs,
  or wallet/Supabase/Privy context — and push that boundary to the leaves so as much of the
  tree as possible stays server-rendered. Files with `"use client"` run in the browser —
  never import `serverEnv`, the Supabase service-role key, or Node-only modules into them.
  Service-role Supabase access happens only in `src/app/api/**` route handlers.
- **Styling:** Tailwind utility classes; prefer components from `@breadcoop/ui` before
  building new ones. Use the `cn` helper from `@/lib/utils` for conditional/merged classes.
- **Buttons:** use the project's local `Button` (`@/components/button`), not
  `@breadcoop/ui`'s `Button` directly — the local wrapper sets the props needed to make the
  library button match the Figma design.
- **Money/time values:** on-chain amounts and timestamps are `bigint`. Keep them as
  `bigint` end-to-end; format only at the display edge. `bigint` is not JSON-serializable —
  convert to string at the API-route / serialization boundary.
- **TypeScript:** strict mode is on. Avoid `any`; prefer `unknown` + narrowing. Unused
  vars/args must be prefixed with `_` or removed (ESLint enforces this).

## Working with contracts

- **Contract writes go through the tx hooks — never raw wagmi/Privy.** Use
  `useSavingCirclesTx` for Saving Circles writes; it simulates the call, then sends via the
  sponsored-tx hooks (`use-sponsored-tx`, `use-simulate-and-sponsor-tx`), which sponsor gas
  on Gnosis (chainId `100`). Calling `writeContract` or `sendTransaction` directly bypasses
  simulation and gas sponsorship.
- **Surface contract errors via `parseContractError`.** Don't render raw viem/wagmi error
  strings. `parseContractError` (`src/utils/parse-contract-error.ts`) maps revert names to
  user-friendly messages from `SAVING_CIRCLES_ERRORS` (`src/lib/contract-errors.ts`). When
  the contract gains a new custom error, add its message to that map.

## Guardrails — do not do these

- **Do not** commit secrets. `.env*` files are gitignored; only `.env.local.example`
  (with empty values) is tracked.
- **Do not** edit anything under `contracts/lib/**` — those are git submodules.
- **Do not** weaken Supabase RLS or move service-role logic to the client. If a change
  seems to require it, stop and flag it.
- **Do not** log or expose secrets that move funds — the service-role key or
  `AUTOMATIC_FUNDING_PRIVATE_KEY` — and don't weaken the gas-sponsorship or Sepolia
  auto-funding logic.
- **Do not** add dependencies without need; this repo pins pnpm settings
  (`pnpm-workspace.yaml`) including a minimum release age and build-script allowlist.
- **Do not** reformat or refactor code unrelated to your change.
- **Do not** delete pre-existing dead/commented code unless asked — mention it instead.

## Pull requests

- Branch from and target **`development`** (not `main`/`master`).
- Use **Conventional Commits** (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`…) and
  reference the issue number when fixing an issue.
- Keep PRs focused; describe what you changed and how you verified it (the gates above).

Full workflow details: [CONTRIBUTING.md](./CONTRIBUTING.md).
