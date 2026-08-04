# Architecture

How App-Stacks (Saving Circles) fits together. Read this before making structural
changes. For day-to-day conventions and commands, see [AGENTS.md](../AGENTS.md); for the
off-chain data model and privacy rules, see [SUPABASE.md](./SUPABASE.md); for what each
of the four stack types actually does, see [STACK_TYPES.md](./STACK_TYPES.md).

## The big picture

App-Stacks is a **rotating savings circle** ("stack"). A circle has a fixed deposit
amount, a set of members, and a number of rounds. Each round, every member deposits, and
one member claims the pooled funds. This repeats until everyone has been paid.

There are two sources of truth:

1. **On-chain (Solidity / Saving Circles contracts)** — the money and the rules:
   membership, deposits, claims, rounds, decommissioning. This is authoritative for
   anything involving funds.
2. **Off-chain (Supabase)** — human-friendly metadata that doesn't belong on-chain: stack
   display name, invite links, user profiles. Access is gated by Row Level Security so
   **non-members can't read a circle's private data**. See [SUPABASE.md](./SUPABASE.md).

The frontend is a Next.js App Router application that orchestrates both.

```text
            ┌────────────────────────── Browser (Next.js client) ──────────────────────────┐
            │  React 19 + @breadcoop/ui  ·  wagmi/viem  ·  Privy  ·  TanStack Query          │
            └───────────────┬───────────────────────────────────────┬───────────────────────┘
                            │ read/write contracts                  │ fetch / mutate metadata
                            ▼                                       ▼
                 ┌────────────────────┐               ┌────────────────────────────┐
                 │ Saving Circles      │              │ Next.js API routes          │
                 │ contracts (on-chain)│              │ src/app/api/** (server)      │
                 └────────────────────┘               └──────────────┬─────────────┘
                                                                      │ service-role
                                                                      ▼
                                                       ┌────────────────────────────┐
                                                       │ Supabase (Postgres + RLS)   │
                                                       │ Upstash Redis (cache)        │
                                                       └────────────────────────────┘
```

## Frontend layers

| Layer          | Location            | Responsibility                                                      |
| -------------- | ------------------- | ------------------------------------------------------------------- |
| Routes / pages | `src/app/**`        | App Router pages (`/`, `/new`, `/stacks/[id]`, `/stacks/join`)      |
| API routes     | `src/app/api/**`    | Server handlers — the only place service-role secrets are used      |
| Components     | `src/components/**` | UI; prefer `@breadcoop/ui`, compose with Tailwind                   |
| Hooks          | `src/hooks/**`      | One concern per `use-*.ts`; wrap contract reads/writes and Supabase |
| Lib            | `src/lib/**`        | Env, supabase client + types, wagmi config, ABIs, constants, tokens |
| Utils          | `src/utils/**`      | Pure helpers (address, chain, time, shorten, paginate-logs…)        |
| Interfaces     | `src/interfaces/**` | Shared TS types (`circle`, `deposit-interval`)                      |

### Routes (`src/app`)

- `/` (`page.tsx`) — dashboard / home.
- `/new` — pick a stack type, then create it. The picker leads to the ROSCA
  wizard or, feature-gated, to `/new/asca`, `/new/goal`, `/new/collective`.
- `/stacks/[id]` — a single ROSCA circle's detail and actions.
- `/ascas/[id]`, `/goals/[id]`, `/funds/[id]` — detail pages for the three new
  stack types (Savings & credit fund, Goal savings, Collective fund), each
  feature-gated (`asca` / `goalSavings` / `collectiveFund`). What each type is and
  how its flow works: [STACK_TYPES.md](./STACK_TYPES.md).
- `/stacks/join` — accept an invite link (`?type=` switches the contract).
- `api/onboard` — create the Supabase user record after Privy login.
- `api/user` — look up a user by Privy id.
- `api/shorten` — invite-link shortening (spoo.me + Upstash Redis).

### Provider stack (`src/components/providers/index.tsx`)

Providers nest in this order (outer → inner):

```text
ToolsProviders            React Query etc. (tooling)
  PrivyProvider           auth + embedded wallets
    SupabaseProvider      Supabase client, signs in with the Privy token
      Web3Provider        wagmi config
        BreadUIKitProvider  @breadcoop/ui (app="stacks", token config)
          ConnectedUserProvider
            SepoliaAutoFund   auto-funds embedded wallets on Sepolia
              ModalProvider   app modal context
```

Anything that needs the wallet, Supabase session, or UI-kit context must render inside
these providers.

## On-chain integration

On-chain behavior is defined by the Saving Circles source at
`contracts/lib/saving-circles/src/` — read it before adding or changing any read/write
hook (see [AGENTS.md](../AGENTS.md)). The ABIs in `src/lib/abis/` mirror it.

- Contract addresses come from validated env (`src/lib/constants.ts` →
  `clientEnv`): `SAVING_CIRCLES_CONTRACT_ADDRESS`,
  `SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS`, `BREAD_TOKEN_ADDRESS`.
- ABIs live in `src/lib/abis/` (`saving-circles`, `saving-circles-viewers`, `bread-abi`,
  `erc20-abi`).
- **Reads** use `useReadContract` wrapped in a `use-*.ts` hook that passes
  `chainId: getDefaultChainId()` and a `query.enabled` guard. Template:
  `src/hooks/use-circle-members.ts`.
- **Writes** go through the transaction hooks (`use-saving-circles-tx`,
  `use-sponsored-tx`, `use-simulate-and-sponsor-tx`, `use-wait-for-tx-receipt`), some of
  which sponsor gas for embedded wallets.
- Event history is paginated via `src/utils/paginate-logs.ts`.
- Circle **status** (pending-start, in-progress, payment due, deposited, claimable,
  expired, failed, finished, decommissioned) is derived purely from on-chain state in
  `src/lib/get-user-circle-status.ts` — start there to understand the circle lifecycle.

The `contracts/` directory is a Foundry project; the Saving Circles source is a git
submodule (`.gitmodules`). Local deployment is driven by the `makefile` (see README).
Do not edit anything under `contracts/lib/**`.

## Off-chain integration (Supabase)

- Browser client and DB types: `src/lib/supabase.ts` (typed `Database`). The client signs
  in with the Privy access token (`signInWithPrivyToken`).
- Privileged operations use the **service-role** key and run **only** in API routes
  (`src/app/api/**`, e.g. `api/user/route.ts`). Never expose that key to the client.
- The privacy guarantee — who can read which circle's metadata — is enforced by Postgres
  RLS, documented in [SUPABASE.md](./SUPABASE.md).

## Configuration

- All env vars are Zod-validated at load: client vars in `src/lib/env.ts` (`clientEnv`),
  server-only vars in `src/lib/envs/server.ts` (`serverEnv`). The app throws on startup if
  anything required is missing.
- Chain selection is driven by `NEXT_PUBLIC_CHAIN_ID` (`src/utils/network.ts`,
  `src/utils/chain.ts`). The app targets a single chain at a time (local Anvil/Gnosis fork,
  Sepolia, or Gnosis mainnet).
- When adding an env var, update the Zod schema **and** `.env.local.example`.
