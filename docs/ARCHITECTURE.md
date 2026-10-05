# Architecture

How App-Stacks (Saving Circles) fits together. Read this before making structural
changes. For day-to-day conventions and commands, see [AGENTS.md](../AGENTS.md); for the
off-chain data model and privacy rules, see [SUPABASE.md](./SUPABASE.md).

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
- `/new` — create a new stack. With the `goalSavings` feature on, a picker links to
  Rotating savings (`/new/rosca`) or a Shared goal (`/new/goal`). Both flows link back
  to the picker. With the feature off, `/new` keeps the original rotating savings flow.
- `/goals/[id]` — a Shared goal's detail and actions (feature-gated: `goalSavings`).
- `/stacks/[id]` — a single circle's detail and actions.
- `/stacks/join` — accept an invite link.
- `api/onboard` — create the Supabase user record after Privy login.
- `api/user` — look up a user by Privy id.
- `api/shorten` — invite-link shortening (spoo.me + Upstash Redis).

(Not exhaustive — `api/stacks/*`, `api/profile`, `api/minipay/session` and
`api/funding/sepolia-embedded` also exist.)

### Provider stack (`src/components/providers/index.tsx`)

The chain is resolved first, then exactly one of two wallet stacks mounts
(`next/dynamic`, so a client downloads only the one it uses):

```text
ActiveChainProvider          the active chain, from ?chain= or the browser
  IsMiniPayBrowserProvider   is the *browser* MiniPay (regardless of chain)
    IsMiniPayProvider        did the MiniPay *stack* mount (browser AND Celo)
      ChainBrowserGuard      stops here if chain and browser don't pair
        │
        ├── MiniPayProviders ─ QueryClientProvider → WagmiProvider (injected)
        │                      → RainbowKitProvider → SupabaseProvider
        │                      → BreadUIKitProvider → ConnectedUserProvider
        │                      → MiniPayAutoConnect → ModalProvider
        │                      → MiniPayIdentityProvider → MiniPayTxSenderProvider
        │
        └── PrivyProviders ─── PrivyProvider → SupabaseProvider → Web3Provider
                               → BreadUIKitProvider → ConnectedUserProvider
                               → SepoliaAutoFund → ModalProvider
                               → PrivyUserIdentityProvider → PrivyTxSenderProvider
                               → OnboardVisitorTracker, LoginTracker
```

Two consequences worth knowing:

- `ModalProvider` lives **inside** each stack, so anything calling `useModal()` must be
  below one. The `ModalPresenter` / `Navbar` / banner / `main` / `Footer` shell is passed
  in as `children`, which is why it satisfies that.
- `ChainBrowserGuard` sits **above** both stacks, so when it triggers the entire shell —
  navbar, banner, page — is replaced by the instruction screen. It therefore cannot use
  anything from either stack, only `useActiveChainId()` and `useIsMiniPayBrowser()`.
- A component that is Privy-only must not simply be mounted in the shared shell: it will
  render inside the MiniPay stack too, where there is no `PrivyProvider`. Gate it on
  `useIsMiniPay()` in a wrapper so the Privy hooks are never called — see
  `src/components/migrate-and-transfer-banner.tsx`.

Anything that needs the wallet, Supabase session, or UI-kit context must render inside
these providers.

## On-chain integration

On-chain behavior is defined by the Saving Circles source at
`contracts/lib/saving-circles/src/` — read it before adding or changing any read/write
hook (see [AGENTS.md](../AGENTS.md)). The ABIs in `src/lib/abis/` mirror it.

- Contract addresses and the deposit token are **per chain**, read with
  `useChainConfig()` / `useDepositToken()`
  (`src/components/providers/active-chain.tsx`) — `savingCircles`,
  `savingCirclesViewer`, `automaticSavingCircles`, `contractCreationBlock`,
  `depositToken`. They come from `NEXT_PUBLIC_CHAINS` via `src/lib/chains.ts`; there are
  no module-level address constants, because a module constant is fixed at import and
  cannot follow the active chain.
- In a pure helper, take what you need as a parameter rather than reaching for the active
  chain: `formatDepositAmount(value, decimals)`,
  `getChainConfig(chainId)`, `getFeeCurrency(chainId)`.
- ABIs live in `src/lib/abis/` (`saving-circles`, `saving-circles-viewers`, `bread-abi`,
  `erc20-abi`).
- **Reads** use `useReadContract` wrapped in a `use-*.ts` hook that passes
  `chainId: useActiveChainId()` and a `query.enabled` guard. Template:
  `src/hooks/use-circle-members.ts`. Include the chain in the TanStack query key too —
  circle ids repeat across chains, so a key of `[..., circleId]` alone serves one chain's
  data for another.
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
- **One deployment serves every configured chain.** `NEXT_PUBLIC_CHAINS` is a JSON map
  keyed by chain id holding that chain's contracts and deposit token
  (`src/lib/envs/chain-schema.ts`). Every configured chain must also have a slug in
  `CHAIN_SLUGS` (`src/lib/chain-slugs.ts`) or the app refuses to boot.
- **The chain travels in the `?chain=` query param**, e.g. `/stacks/5?chain=celo`. It has
  to be in the URL because circle ids come from a per-chain counter
  (`SavingCircles.sol`, `_id = nextId++`), so circle 5 exists on every chain as an
  unrelated stack. Build in-app links with `useChainPath()` — never concatenate the param
  by hand, or a path that already has a query string gets a second `?`.
- The chain is resolved once, in `src/components/providers/index.tsx`, and passed to
  `ActiveChainProvider`. Everything below reads it with `useActiveChainId()` /
  `useChainConfig()` / `useDepositToken()` (`src/components/providers/active-chain.tsx`).
  Never read `NEXT_PUBLIC_CHAIN_ID` in feature code.
- That resolution runs with `useSearchParams()` in a _client_ component, which still
  gives the value during the **server** render because every route is dynamic — the
  layout's `headers()` calls (`isServerMobile`, `isServerMiniPay`) opt the tree in. That
  matters: if the chain were only known after hydration, `Providers` would pick the
  MiniPay-vs-Privy branch late and briefly mount the wrong stack.
- **When the URL doesn't settle it, the browser does:** MiniPay → the first configured
  Celo chain, anything else → `NEXT_PUBLIC_CHAIN_ID` if configured, else the first
  configured chain. A `?chain=` naming an unknown or unconfigured chain is treated the
  same as none — nothing in the app emits one, so that path is only for hand-edited or
  stale links. There is no middleware and no redirect; a chain-less URL stays as typed.
- **A chain only works in one browser.** `ChainBrowserGuard`
  (`src/components/chain-browser-guard.tsx`) replaces the app with an instruction screen
  when the pairing is wrong: Celo outside MiniPay, or a non-Celo chain inside it. Not a
  style choice — writes are impossible either way (gas sponsorship is Gnosis-only in
  `providers/tx-sender.tsx`, the CIP-64 fee currency exists only in the MiniPay sender,
  and MiniPay has no message signing).
- Route handlers can't use hooks, so they take the chain from the request and resolve it
  with `resolveChainId` (`src/lib/envs/server-chains.ts`). The same value must feed both
  the on-chain authorization check and the database query — checking one chain and
  reading another would let a caller who owns circle N on chain A read chain B's rows.
  Where the chain is already server state, read it from there instead: the join-request
  `PATCH` takes it off the row, not the caller.
- `NEXT_PUBLIC_CHAIN_ID` names only the fallback chain for a URL that doesn't specify one.
- `NEXT_PUBLIC_NODE_ENV` names the deployment's tier only, required with no default:
  `local`, `development`, `prod`. Code that cares about tier should check `isLocalEnv`
  (`src/lib/env.ts`).
- When adding an env var, update the Zod schema **and** `.env.local.example`.
