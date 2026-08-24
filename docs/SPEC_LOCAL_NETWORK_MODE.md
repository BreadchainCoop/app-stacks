# Spec: Runtime network mode — "Demo local" vs "Demo Sepolia"

Status: implemented. Revised after review — the local Supabase layer was dropped in
favour of localStorage, and the makefile reuses the existing local-setup targets
instead of adding parallel ones.

## Motivation

Today `development` and `demo` run against Sepolia and `production` against Gnosis,
with the chain id and contract addresses resolved at build time from env vars. Testing
round progression on Sepolia means waiting for real round intervals (minutes to days).

We want a way to iterate fast against a **local Anvil deployment**, selectable at
runtime, without giving up the current Sepolia flow (create a stack, join from other
devices). Concretely:

- When the app opens in `development` or `demo` (including the deployed sites), the
  first thing the user sees is a popup: **"Demo local"** or **"Demo Sepolia"**, with an
  info icon explaining what each implies.
- In local mode there is **no round-interval selection** when creating a stack.
  Instead, the stack detail page has a **"Next round" button** that advances the local
  node's clock past the current deposit window (whether or not every member deposited).
- In local mode the user can **switch between profiles** (the 10 well-known Anvil
  accounts) to act as different members for deposits and claims.
- The `saving-circles` submodule stays updated to the latest `dev`.

## What already exists

Much of the local infrastructure is already in place:

- `makefile`: `anvil` (Gnosis fork, chain id 31337, `--block-time 5`), `deploy`
  (Foundry `contracts/script/Deploy.s.sol`: MockBread + SavingCircles proxy +
  AutomaticSavingCircles + SavingCirclesViewer, writes
  `contracts/out/SAVING_CIRCLES_DEPLOYMENT.json`), `update-env`, `start-local`,
  `reset-supabase`, time helpers (`warp`, `time-increase`, `mine`, `time-reset`),
  `fund-wallet`. **All of these are reused as-is** — this spec adds only the
  deterministic deployer on top (see below) and a `fund-all` alias over
  `fund-wallet`.
- `supabase/`: checked-in migrations and a CLI workflow (`pnpm db:push:*`,
  `supabase/README.md`). Local mode deliberately does not touch any of it.
- Frontend: chain 31337 (`foundryChain`) is configured in `src/utils/network.ts` /
  `src/lib/wagmi.ts`; `src/hooks/use-block-timestamp.ts` already reads the block
  timestamp from the chain when the env is `local`, so Anvil time manipulation is
  reflected in the UI.

The new work is the **runtime selector** (today the mode is fixed at build time), the
in-app **"Next round" button**, the **account switcher**, and the local-mode branches
in the write/data paths.

## Agreed decisions

- Local mode works **from the deployed dev/demo sites too**: the browser talks directly
  to `http://localhost:8545` (Anvil). Chrome/Edge only — Safari/Firefox block mixed
  content to localhost.
- **`make anvil` + `make deploy` is the entire setup.** No `.env.local`, no Supabase,
  no Docker: the contract addresses are deterministic and baked into the bundle, so
  the hosted demo site drives a developer's node with zero local configuration.
- Profile switching: **in-app switcher** using the 10 Anvil accounts via wagmi's `mock`
  connector. Anvil signs server-side (accounts are unlocked) — no private keys in the
  app.
- Off-chain metadata in local mode: **localStorage**, not a database (see below).

## Architecture

### Mode resolution: `src/lib/network-mode.ts` (new)

- Mode (`"sepolia" | "local"`) persisted in localStorage (`stacks.network-mode`), read
  **synchronously at module scope**.
- `isLocalMode()` = env is `local` (developer `.env.local`, unchanged workflow) OR (env
  is `development`/`demo` AND stored mode is `"local"`). Always `false` in `production`
  and during SSR.
- `setNetworkMode(mode)` persists and calls `window.location.reload()`.
- **Reload-on-switch, not live switch**: on mode or account change the page reloads, so
  `src/lib/constants.ts`, `src/utils/chain.ts` and the wagmi config stay module-scope
  ternaries and the ~35 consumer files don't change at all.
- Also exports `LOCAL_ANVIL_ACCOUNTS` (10 addresses) and
  `getLocalAccountIndex()` / `setLocalAccountIndex(i)` (persist + reload).
- SSR fallback is the build-time env (Sepolia values); worst case is a benign
  hydration warning on address-derived text.

### Deterministic local addresses

The deployed site cannot read `contracts/out/SAVING_CIRCLES_DEPLOYMENT.json`, so local
addresses must be known ahead of time:

- A **dedicated virgin deployer keypair** is committed in the makefile (local-only key,
  not a secret). Before deploying, `anvil_setBalance` + `anvil_setNonce 0` guarantee
  nonces 0..5 regardless of the forked Gnosis state.
- Addresses are plain `CREATE(deployer, nonce)` — immune to contract bytecode changes
  (CREATE2 was rejected: init-code-hash-dependent addresses would silently change on
  every saving-circles submodule update). They only change if `Deploy.s.sol`
  adds/reorders deployments; `make deploy` sanity-checks the deployment JSON against
  the expected addresses and fails loudly.
- The fixed addresses are baked as defaults of the new `NEXT_PUBLIC_ANVIL_*` env vars.
  (Namespaced `ANVIL_`, not `LOCAL_`, because `NEXT_PUBLIC_LOCAL_BREAD_TOKEN_ADDRESS`
  already exists in older `.env.local` files from the `NEXT_PUBLIC_TARGET_NETWORK` era
  and would silently override the default.)
- `ADMIN_ADDRESS` stays Anvil account 0 so `make fund-wallet` (BREAD transfers from the
  admin) keeps working.

### Privy bypass in local mode

- `PrivyProvider` stays mounted always (so Privy hooks never throw).
- In local mode: `BreadUIKitProvider authProvider="general"` (its
  `ConnectedUserProvider` then derives the user from wagmi `useAccount` — verified in
  `@breadcoop/ui`), and a plain `wagmi` `WagmiProvider` — NOT `@privy-io/wagmi`'s,
  whose wallet-sync effect wipes non-Privy connector state — with
  `chains: [foundryChain]` and a single `mock` connector (active account first,
  `defaultConnected`).
- Write paths that currently go through Privy get a local branch:
  `src/hooks/use-sponsored-tx.ts` → `sendTransaction` from `@wagmi/core`; invite
  typed-data signing in `stack-result.tsx` → wagmi `useSignTypedData` (Anvil supports
  `eth_signTypedData_v4` for unlocked accounts).

### Off-chain metadata: localStorage, no Supabase

Stack names, invite links and stack membership live in the hosted app's Supabase.
Local mode can reach neither half of that flow: the write paths are API routes using
the service-role key (a deployed site cannot call them against a developer's machine)
and there is no Privy identity to attribute writes to.

An earlier revision of this spec solved that with a **local Supabase instance** the
browser wrote to directly under permissive RLS. That was dropped in review: it
duplicated the Supabase tooling the repo already has, and it made Docker + the
Supabase CLI a prerequisite for what is meant to be a throwaway demo.

Local mode instead keeps this data in **localStorage** (`src/lib/local-metadata.ts`),
mirroring the three API routes' behaviour:

- `getLocalStackMetadata(id)` / `getLocalStacksMetadata(address)` for the two client
  read paths (`use-stack-supabase.ts`, `use-user-stacks-metadata.ts`).
- `createLocalStackMetadata(...)` mirrors `POST /api/stacks/metadata`.
- `redeemLocalInvite(...)` mirrors `PATCH /api/stacks/invite`.

One store per browser, membership keyed by Anvil account, so switching accounts in
the navbar behaves like switching users. `createSupabaseClient()` is untouched and
still points at the hosted project — local mode simply never reads or writes stack
metadata through it, so no local data can leak into a shared environment.

Limitation: an invite opened in a **different browser** has no stack row to name, so
it shows as `Stack <id>` there. Everything else — create, join, deposit, "Next round",
claim — is on-chain and unaffected. Reusing the shared dev Supabase was rejected
outright: `stacks_metadata.id` is the raw on-chain circle id, so fresh local
deployments (ids 0, 1, 2…) would collide with Sepolia rows.

### Fixed interval + "Next round" button

- Anvil runs with `--block-time 5`, so chain time advances in real time. In local mode
  `DEPOSIT_INTERVALS` collapses to a single 30-day entry (`1month`) — long enough that
  rounds only ever advance via the button. The local list is a **hardcoded constant**,
  not an env value: `src/utils/deposit-interval.ts` becomes
  `isLocalMode() ? LOCAL_DEPOSIT_INTERVALS : clientEnv.NEXT_PUBLIC_DEPOSIT_INTERVALS`.
  Do not thread it through `NEXT_PUBLIC_DEPOSIT_INTERVALS` — the zod schema in
  `src/lib/env.ts` requires ≥2 entries and stays untouched (module-scope resolution is
  safe thanks to reload-on-switch). The interval radio group in the stack creation
  form is hidden when there's a single option.
- `next-round-button.tsx` (stack detail, local mode only): viem
  `createTestClient({ mode: "anvil" })` → `setNextBlockTimestamp(depositWindowEnd + 1)`
  (or `increaseTime` if already past) → `mine` → `queryClient.invalidateQueries()`.
  Time moves regardless of deposit completeness, matching the contract's natural
  behavior for incomplete rounds.

### Mode-selection popup

- New modal type `NETWORK_MODE_SELECT` following the `NEW_USER_ONBOARDING` pattern
  (`src/components/modal/context.tsx`, `presenter.tsx`, `modals/network-mode.tsx`).
- Options "Demo local" / "Demo Sepolia" with info icons (local: requires `make anvil` +
  `make deploy` on the user's machine, Chrome/Edge only from the hosted site; Sepolia:
  real testnet, Privy login, multi-device join).
- Escape-dismissal is blocked (a choice is required). A small chip in the Navbar
  (dev/demo only) shows the active mode and reopens the modal.
- Trigger: a `network-mode-gate.tsx` component in the root layout opens the modal when
  the env is `development`/`demo` and no mode is stored.

## Implementation phases

0. **Submodule**: `make update-saving-circles-dev`, commit the pointer; diff contract
   events/functions against `src/lib/abis/*` and refresh if drifted. Compute the
   deterministic addresses with a fresh deploy.
1. `src/lib/network-mode.ts` (new).
2. Env vars (`src/lib/env.ts`, `.env.local.example`):
   `NEXT_PUBLIC_ANVIL_{SAVING_CIRCLES,SAVING_CIRCLES_VIEWER,AUTOMATIC_SAVING_CIRCLES,BREAD_TOKEN}_ADDRESS`
   and `NEXT_PUBLIC_ANVIL_RPC_URL` — all optional with defaults, so nothing has to be
   configured to use the hosted site.
3. Mode ternaries in `src/lib/constants.ts` and `src/utils/chain.ts` (zero consumer
   changes). Creation block helper: local → memoized `anvil_nodeInfo.forkBlockNumber`;
   update the 4 consumer hooks (`use-get-cricle-created`, `use-get-last-claimed`,
   `use-invite-redeemed`, `use-funds-deposited`).
4. Providers (`src/components/providers/web3.tsx`, `index.tsx`): start with a
   10-minute spike verifying the `mock` connector forwards `eth_sendTransaction` /
   `eth_signTypedData_v4` through the transport to Anvil (it's the load-bearing
   assumption of the Privy bypass). Then wagmi config + provider branch — removing
   the existing `process.env.NODE_ENV === "development"` foundryChain conditional in
   `web3.tsx`, subsumed by the mode branch — `authProvider` switch, skip
   `SepoliaAutoFund` in local mode.
5. Mode-selection popup + Navbar chip + gate component.
6. Local write paths (`use-sponsored-tx.ts`, `stack-result.tsx`; owner identity from
   `useConnectedUser`). `shortenUrl`/`expandShortUrlToken` no-op in local mode — in
   `src/utils/shorten.ts` itself, so every caller is covered.
7. localStorage metadata layer (`src/lib/local-metadata.ts`) plus the read branches in
   `use-stack-supabase.ts` / `use-user-stacks-metadata.ts` and the write branches in
   `stack-result.tsx` / `accept-invite.tsx`.
8. Fixed interval + hidden radio (`src/utils/deposit-interval.ts`,
   `src/app/new/_components/form/form.tsx`).
9. "Next round" button; migrate remaining `env === "local"` checks to `isLocalMode()`
   (`use-block-timestamp.ts`, `features.ts`, `stack-result.tsx`).
10. Account switcher in Navbar (`local-account-switcher.tsx`).
11. Makefile — additive only, every existing target reused unchanged: deterministic
    deployer (`LOCAL_DEPLOYER_PK/_ADDRESS`, setBalance + setNonce 0), the
    `check-deployment` guard, and a `fund-all` alias over `fund-wallet`. `deploy`
    skips `update-env` when there is no `.env.local` (it is only needed to run the
    dev server yourself).

## Known risks / limitations

- **Browser support**: https deployed site → http localhost RPC relies on the
  mixed-content localhost exemption — Chrome/Edge only. Stated in the popup info.
  Chrome's Local Network Access rollout may additionally show a one-time permission
  prompt for public-site → localhost requests; Anvil's default CORS (`*`) should
  otherwise suffice.
- **Hydration warnings**: SSR resolves Sepolia values, client may resolve local.
  Cosmetic; gate specific offenders behind a mounted check only if warnings appear.
- **Address drift**: deterministic addresses break if `Deploy.s.sol` changes deployment
  order/count — caught loudly by the makefile sanity check; regenerate the env
  defaults then.
- **Metadata is per-browser**: stack names and invite-redemption state live in
  localStorage, so a link opened in another browser shows `Stack <id>`. Clearing site
  data resets it; the on-chain flow is unaffected.

## Verification checklist

1. `pnpm lint`, `pnpm build`, `pnpm format:check` — clean.
2. `NEXT_PUBLIC_NODE_ENV=production`: no popup, no switcher, behavior identical to
   today.
3. Sepolia mode (dev env): popup appears once, choice persists across reloads; Privy
   login, create stack with real intervals, invite/join from a second browser —
   unchanged.
4. Local mode (Chrome; `make anvil` + `make deploy` only): auto-connected as Anvil
   account 0 without Privy; `make deploy` prints "✓ Deployment matches the
   deterministic local addresses"; create stack (interval radio hidden); stack name
   visible; switch to accounts 1–2, redeem invites, deposit from each (after
   `make fund-all`); "Next round" advances past `depositWindowEnd` and the UI updates
   without manual refresh; claim as the round's recipient; restart Anvil + redeploy →
   same addresses.
5. Deployed dev site (or `pnpm build && pnpm start` with dev env) in local mode against
   the machine's Anvil, **in a clone with no `.env.local`** — same flow as (4),
   confirming no dependence on local API routes or local configuration.
