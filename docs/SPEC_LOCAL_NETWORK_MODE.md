# Spec: Runtime network mode — "Demo local" vs "Demo Sepolia"

Status: draft — pending team review before implementation.

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
  `fund-wallet`.
- Frontend: chain 31337 (`foundryChain`) is configured in `src/utils/network.ts` /
  `src/lib/wagmi.ts`; `src/hooks/use-block-timestamp.ts` already reads the block
  timestamp from the chain when the env is `local`, so Anvil time manipulation is
  reflected in the UI.

The new work is the **runtime selector** (today the mode is fixed at build time), the
in-app **"Next round" button**, the **account switcher**, and the local-mode branches
in the write/data paths.

## Agreed decisions

- Local mode works **from the deployed dev/demo sites too**: the browser talks directly
  to `http://localhost:8545` (Anvil) and `http://127.0.0.1:54321` (local Supabase).
  Chrome/Edge only — Safari/Firefox block mixed content to localhost.
- Profile switching: **in-app switcher** using the 10 Anvil accounts via wagmi's `mock`
  connector. Anvil signs server-side (accounts are unlocked) — no private keys in the
  app.
- Off-chain metadata in local mode: **local Supabase** (standard CLI URL/anon key),
  accessed directly from the browser with permissive RLS **on the local instance
  only**.

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
- The fixed addresses are baked as defaults of the new `NEXT_PUBLIC_LOCAL_*` env vars.
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

### Local Supabase, no auth

- Client-side reads already use only the anon key (the Privy sign-in helper in
  `src/lib/supabase.ts` is never called). Writes go through server API routes with the
  service-role key — which a deployed site cannot use against a user's localhost
  instance.
- Local mode therefore talks **directly from the browser** to the local Supabase:
  - `createSupabaseClient()` gets a mode ternary for URL/anon key (covers all readers).
  - A small `src/lib/local-supabase.ts` replicates the three API routes' logic
    (`ensureLocalUser`, `createStackMetadata`, `redeemInvite`), with synthetic identity
    `privy_user_id = "local:<address>"`.
  - Permissive RLS policies for the local instance live in `supabase/local-rls.sql`
    (checked in), applied via `make local-supabase-setup`.
- **Deliberate, documented guardrail exception**: RLS is relaxed only on the throwaway
  localhost instance; hosted projects and the service-role boundary are untouched.
- Reusing the shared dev Supabase was rejected: `stacks_metadata.id` is the raw
  on-chain circle id, so fresh local deployments (ids 0, 1, 2…) would collide with
  Sepolia rows.

### Fixed interval + "Next round" button

- Anvil runs with `--block-time 5`, so chain time advances in real time. In local mode
  `DEPOSIT_INTERVALS` collapses to a single 30-day entry (`1month`) — long enough that
  rounds only ever advance via the button. The interval radio group in the stack
  creation form is hidden when there's a single option.
- `next-round-button.tsx` (stack detail, local mode only): viem
  `createTestClient({ mode: "anvil" })` → `setNextBlockTimestamp(depositWindowEnd + 1)`
  (or `increaseTime` if already past) → `mine` → `queryClient.invalidateQueries()`.
  Time moves regardless of deposit completeness, matching the contract's natural
  behavior for incomplete rounds.

### Mode-selection popup

- New modal type `NETWORK_MODE_SELECT` following the `NEW_USER_ONBOARDING` pattern
  (`src/components/modal/context.tsx`, `presenter.tsx`, `modals/network-mode.tsx`).
- Options "Demo local" / "Demo Sepolia" with info icons (local: requires `make anvil` +
  `make deploy` + `supabase start` on the user's machine, Chrome/Edge only from the
  hosted site; Sepolia: real testnet, Privy login, multi-device join).
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
   `NEXT_PUBLIC_LOCAL_{SAVING_CIRCLES,SAVING_CIRCLES_VIEWER,AUTOMATIC_SAVING_CIRCLES,BREAD_TOKEN}_ADDRESS`,
   `NEXT_PUBLIC_LOCAL_RPC_URL`, `NEXT_PUBLIC_LOCAL_SUPABASE_URL`,
   `NEXT_PUBLIC_LOCAL_SUPABASE_ANON_KEY` — all optional with defaults.
3. Mode ternaries in `src/lib/constants.ts` and `src/utils/chain.ts` (zero consumer
   changes). Creation block helper: local → memoized `anvil_nodeInfo.forkBlockNumber`;
   update the 4 consumer hooks (`use-get-cricle-created`, `use-get-last-claimed`,
   `use-invite-redeemed`, `use-funds-deposited`).
4. Providers (`src/components/providers/web3.tsx`, `index.tsx`): wagmi config +
   provider branch, `authProvider` switch, skip `SepoliaAutoFund` in local mode.
5. Mode-selection popup + Navbar chip + gate component.
6. Local write paths (`use-sponsored-tx.ts`, `stack-result.tsx`; skip `shortenUrl`
   locally, owner identity from `useConnectedUser`).
7. Local Supabase data layer (`local-supabase.ts`, client ternary, call-site branches,
   `supabase/local-rls.sql`, `make local-supabase-setup`).
8. Fixed interval + hidden radio (`src/utils/deposit-interval.ts`,
   `src/app/new/_components/form/form.tsx`).
9. "Next round" button; migrate remaining `env === "local"` checks to `isLocalMode()`
   (`use-block-timestamp.ts`, `features.ts`, `stack-result.tsx`).
10. Account switcher in Navbar (`local-account-switcher.tsx`), `ensureLocalUser` on
    connect.
11. Makefile: deterministic deployer (`LOCAL_DEPLOYER_PK/_ADDRESS`, setBalance +
    setNonce 0, address sanity check), `start-local` depends on
    `update-saving-circles-dev`, optional `fund-all`.

## Known risks / limitations

- **Browser support**: https deployed site → http localhost RPC/Supabase relies on the
  mixed-content localhost exemption — Chrome/Edge only. Stated in the popup info.
- **Hydration warnings**: SSR resolves Sepolia values, client may resolve local.
  Cosmetic; gate specific offenders behind a mounted check only if warnings appear.
- **Address drift**: deterministic addresses break if `Deploy.s.sol` changes deployment
  order/count — caught loudly by the makefile sanity check; regenerate the env
  defaults then.
- **Local Supabase prerequisites**: the deployed-site local flow needs `supabase start`
  with the schema plus `local-rls.sql`. If the schema currently lives only in the
  hosted dashboard, exporting it into `supabase/` is a prerequisite for first-time
  users.

## Verification checklist

1. `pnpm lint`, `pnpm build`, `pnpm format:check` — clean.
2. `NEXT_PUBLIC_NODE_ENV=production`: no popup, no switcher, behavior identical to
   today.
3. Sepolia mode (dev env): popup appears once, choice persists across reloads; Privy
   login, create stack with real intervals, invite/join from a second browser —
   unchanged.
4. Local mode (Chrome; `make anvil` + `make deploy` + `supabase start`): auto-connected
   as Anvil account 0 without Privy; addresses in the deployment JSON match
   `NEXT_PUBLIC_LOCAL_*`; create stack (interval radio hidden); stack name visible
   (local Supabase); switch to accounts 1–2, redeem invites, deposit from each; "Next
   round" advances past `depositWindowEnd` and the UI updates without manual refresh;
   claim as the round's recipient; restart Anvil + redeploy → same addresses.
5. Deployed dev site (or `pnpm build && pnpm start` with dev env) in local mode against
   the machine's Anvil — same flow as (4), confirming no dependence on local API
   routes.
