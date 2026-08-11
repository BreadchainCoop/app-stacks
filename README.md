# Saving Circles dApp (App-Stacks)

A web app for saving money together with friends and family — a rotating savings circle
("stack"). Members deposit a fixed amount each round, and one member claims the pooled
funds per round until everyone has been paid.

Two halves make up the system:

- **On-chain** — audited Solidity contracts (Saving Circles) hold the money and the rules.
- **Off-chain** — a [Next.js](https://nextjs.org) frontend plus [Supabase](https://supabase.com)
  (Postgres), which stores things that don't belong on a public chain: stack names, invite
  links, and profiles.

**Which path are you on?**

- **Know Next.js and/or Foundry?** → [Quick start](#quick-start) — the commands and the
  five things you can't guess. Skip everything after it unless something breaks.
- **New to one or both?** → [Setup](#setup) — the same steps, explained, no assumed
  knowledge. You don't need to write Solidity or React to run this.

For architecture and code conventions, see [AGENTS.md](./AGENTS.md),
[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md), and [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Quick start

Needs Node 22+, pnpm 11, Foundry, jq, and the Supabase CLI.

```bash
git clone https://github.com/BreadchainCoop/app-stacks.git && cd app-stacks
make update-contract-submodules   # contracts are a git submodule
pnpm install
cp .env.local.example .env.local  # fill it in — see the gotchas below
pnpm db:push:local                # a fresh Supabase project has no tables

make anvil                        # terminal 1: Gnosis fork, chain 31337, :8545
make start-local                  # terminal 2: wipe off-chain data, deploy, run dev
```

Then open **`http://localhost:3001`**, log in with Privy, and fund the embedded wallet it
creates: `make fund-wallet 0xYourAddress` (100 test ETH + 100 BREAD).

**The five things you can't guess:**

1. **The dev server is on `:3001`**, not `:3000`.
2. **Set `NEXT_PUBLIC_NODE_ENV=local` and `NEXT_PUBLIC_CHAIN_ID=31337`.** Without the
   first, `make start-local` aborts on its Supabase-wipe step and every feature flag stays
   off. Leave the contract addresses blank — `make deploy` writes them.
3. **Six third-party accounts are mandatory**, not optional: Supabase, Privy,
   WalletConnect, Alchemy, Upstash Redis, spoo.me. The Zod schemas in `src/lib/env.ts` and
   `src/lib/envs/server.ts` throw at boot on any missing key. See
   [Third-party accounts](#third-party-accounts).
4. **`SUPABASE_DB_URL_LOCAL` must use the session pooler (port `5432`).** Port `6543` fails
   with `prepared statement "..." already exists`.
5. **The chain clock only moves forward.** `make time-increase SECONDS=86400` to advance;
   `make warp` needs a _future_ timestamp because the fork starts at the real present.
   `make anvil-reset` rewinds. See [Time manipulation](#time-manipulation-for-testing).

Everything below is the same ground at a slower pace, plus
[Make commands](#useful-make-commands) and [Troubleshooting](#troubleshooting).

---

## Prerequisites

### Command-line tools

| Tool                                                                 | Why it's needed                                                             |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [Node.js](https://nodejs.org/) v22+                                  | Runs the frontend                                                           |
| [pnpm](https://pnpm.io/installation) 11                              | Package manager. **Do not use npm or yarn** — this repo pins pnpm settings  |
| [Foundry](https://book.getfoundry.sh/getting-started/installation)   | Provides `anvil` (local blockchain), `forge` (compile/deploy), `cast` (RPC) |
| [Git](https://git-scm.com/)                                          | Contracts are pulled in as git submodules                                   |
| [jq](https://jqlang.github.io/jq/download/)                          | The Makefile reads deployed contract addresses out of JSON with it          |
| [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) | Creates the database tables (`brew install supabase/tap/supabase`)          |

Quick check that everything resolves:

```bash
node -v && pnpm -v && forge --version && cast --version && jq --version && supabase --version
```

### Third-party accounts

The app reads configuration from `.env.local`, and it will refuse to start if required
values are missing — the env schemas in `src/lib/env.ts` (browser) and
`src/lib/envs/server.ts` (server) validate them at boot. All of these have free tiers:

| Service                                       | What it does here                          | Values you'll copy                                       |
| --------------------------------------------- | ------------------------------------------ | -------------------------------------------------------- |
| [Supabase](https://supabase.com/dashboard)    | Postgres database for off-chain data       | project URL, `anon` key, `service_role` key, DB password |
| [Privy](https://dashboard.privy.io/)          | Login + gives each user an embedded wallet | app ID, client ID                                        |
| [WalletConnect](https://dashboard.reown.com/) | Lets external wallets connect              | project ID                                               |
| [Alchemy](https://www.alchemy.com/)           | Ethereum mainnet reads (token prices, ENS) | API key                                                  |
| [Upstash Redis](https://console.upstash.com/) | Caches shortened invite links              | REST URL, REST token                                     |
| [spoo.me](https://spoo.me/)                   | Shortens invite links                      | API token                                                |

> A **wallet** is the account that signs blockchain transactions. Privy creates one for
> each user automatically ("embedded wallet") after they log in with email, so you don't
> need MetaMask to click through the app — see
> [Getting a funded wallet](#7-getting-a-funded-wallet).

---

## Setup

The [Quick start](#quick-start) commands again, one at a time and with the reasoning spelled
out. Follow it top to bottom — no Solidity or React knowledge assumed, and jargon is
explained the first time it appears.

### 1. Clone and pull the contracts

The Solidity contracts live in a separate repository, wired in as a git submodule. Without
this step `contracts/lib/` is empty and deployment fails.

```bash
git clone https://github.com/BreadchainCoop/app-stacks.git
cd app-stacks
make update-contract-submodules
```

### 2. Install dependencies

```bash
pnpm install
```

> Installs can look stalled: `pnpm-workspace.yaml` sets `minimumReleaseAge` to 10 days, so
> pnpm deliberately ignores packages published very recently.

### 3. Create your env file

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in the keys from the [accounts above](#third-party-accounts).
Two entries need specific values for local development:

```bash
NEXT_PUBLIC_NODE_ENV=local   # unlocks every feature flag; also required by make reset-supabase
NEXT_PUBLIC_CHAIN_ID=31337   # the local Anvil chain
```

Leave the contract addresses and `NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK`
blank — `make deploy` fills those in for you in step 5.

`SUPABASE_DB_URL_LOCAL` is your Supabase connection string, used only for database
migrations. Take it from **Dashboard → Settings → Database → Connection string → URI**, and
use the **session pooler** (port `5432`); the transaction pooler on port `6543` fails with
`prepared statement "..." already exists`.

### 4. Create the database tables

A fresh Supabase project is empty. Apply the migrations in `supabase/migrations/`:

```bash
pnpm db:push:local
```

This connects straight to the database with `SUPABASE_DB_URL_LOCAL`, so `supabase login`
isn't needed. More detail, including how to add a migration, is in
[`supabase/README.md`](./supabase/README.md).

### 5. Start the local blockchain

**Anvil** is a blockchain that runs on your machine. This repo runs it as a _fork_ of
Gnosis Chain — it copies real Gnosis state on demand, so real tokens exist, but nothing you
do leaves your laptop and no real money is involved.

In its own terminal:

```bash
make anvil
```

This forks Gnosis at the latest block on `http://localhost:8545`, with chain ID `31337`,
mining a block every 5 seconds. **Leave this terminal running** for the whole session.

### 6. Deploy the contracts and start the app

In a second terminal:

```bash
make start-local
```

Which, in order:

1. Wipes off-chain stack data in Supabase (`user_stacks`, `stacks_metadata`) for a clean
   slate — this refuses to run unless `NEXT_PUBLIC_NODE_ENV=local`, so it can never hit a
   shared database
2. Clears previous build output (`contracts/broadcast`, `cache`, `out`)
3. Compiles and deploys the contracts to your Anvil node
4. Writes the deployed addresses and creation block into your `.env.local`
5. Starts the Next.js dev server

Open **[http://localhost:3001](http://localhost:3001)** (note: `3001`, not `3000`).

**Default deployer account:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` — Anvil's first
account, which starts with test funds and owns the deployed contracts.

### 7. Getting a funded wallet

Log in through Privy in the browser. The embedded wallet it creates starts empty, so top it
up with test funds — copy your address from the app, then:

```bash
make fund-wallet 0xYourWalletAddress
```

You now have 100 test ETH (for transaction fees) and 100 test BREAD (the token stacks save
in). See [Funding a wallet](#funding-a-wallet) for the full options.

<details>
<summary>Optional: using MetaMask or another external wallet instead</summary>

Add the local network manually:

- **Network Name**: Anvil Local
- **RPC URL**: `http://localhost:8545`
- **Chain ID**: `31337`
- **Currency Symbol**: `ETH`

To import Anvil's pre-funded first account, use private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.

⚠️ This key is public knowledge and hard-coded in every Foundry install. **Never send real
funds to it or use it on a real network.**

</details>

---

## Development Workflow

### Updating Contract Submodules

If the contract submodules are out of date, update them and redeploy:

```bash
make update-contract-submodules
make anvil-reset
make start-local
```

### Resetting the Local Blockchain

If you need a fresh state:

```bash
make anvil-reset
```

This also rewinds the clock back to the real current time (see
[Time manipulation](#time-manipulation-for-testing)). Then redeploy:

```bash
make start-local
```

If transactions afterwards fail with nonce errors, run `make reset-nonces`.

### Funding a Wallet

When signing in through Privy (or any embedded wallet), the generated address starts with zero balances. Use `make fund-wallet` to top it up with ETH, BREAD, or both. You can pass several addresses at once — the amounts apply to each:

```bash
# Fund with 100 ETH and 100 BREAD (default amounts)
make fund-wallet 0xYourWalletAddress

# Fund several wallets in one go
make fund-wallet 0xWalletA 0xWalletB 0xWalletC

# Fund with a specific ETH amount only
make fund-wallet 0xYourWalletAddress eth=50

# Fund with a specific BREAD amount only
make fund-wallet 0xYourWalletAddress bread=200
```

`eth=` and `bread=` are mutually exclusive — pass neither to fund both with the defaults. The command prints the resulting ETH and BREAD balances for each address once complete.

Requires a deployment to exist, since it reads the BREAD address from
`contracts/out/SAVING_CIRCLES_DEPLOYMENT.json`.

### Time Manipulation (for testing)

Stacks run on rounds that can be days or weeks long. Rather than waiting, move the _chain's_
clock — the Makefile commands below do this via Anvil's RPC. Your system clock is untouched.

**Advance by a number of seconds** — the one you'll normally want:

```bash
make time-increase SECONDS=86400    # advance by 1 day
make time-increase SECONDS=604800   # advance by 1 week
```

**Jump to a specific timestamp:**

```bash
make warp TIMESTAMP=$(($(date +%s) + 86400))   # 1 day from now
```

> ⚠️ **The chain clock only moves forward.** `warp` to a timestamp earlier than the current
> block fails with `Timestamp error: ... is lower than previous block's timestamp`. Because
> `make anvil` forks Gnosis at its _latest_ block, the chain starts at the real present —
> so any fixed past date is rejected. Compute the target relative to now, as above.

**Inspecting and resetting:**

```bash
make timestamp   # print the current block timestamp
make mine        # mine a single block
make time-reset  # pull the chain clock back to your system clock
```

`make time-reset` only succeeds when the chain is _behind_ your system clock — i.e. right
after `make anvil-reset`. Once you've advanced time it fails, by the same forward-only rule.
To get back to real time, use `make anvil-reset`.

**Typical workflow for time-based testing:**

1. Create a stack with a short deposit interval (e.g. 5 minutes) and make deposits
2. `make time-increase SECONDS=2592000` to jump 30 days ahead
3. Reload the app and confirm the round has advanced
4. Advance further with another `make time-increase`

---

## Useful Make Commands

| Command                                | Description                                          |
| -------------------------------------- | ---------------------------------------------------- |
| `make anvil`                           | Start local blockchain (Gnosis fork)                 |
| `make start-local`                     | Clear off-chain data, deploy contracts, start dev    |
| `make deploy`                          | Deploy contracts and update .env.local               |
| `make update-env`                      | Re-read deployed addresses into .env.local           |
| `make reset-supabase`                  | Wipe off-chain stack data (local env only)           |
| `make anvil-reset`                     | Reset blockchain and clock to fresh state            |
| `make reset-nonces`                    | Reset nonces for all Anvil accounts                  |
| `make update-contract-submodules`      | Update contract dependencies                         |
| `make install-contract-deps`           | `forge install` inside `contracts/`                  |
| `make fund-wallet 0xAddr [0xAddr ...]` | Fund one or more wallets with ETH and BREAD          |
| `make fund-wallet 0xAddr eth=N`        | Fund the wallet(s) with N ETH only                   |
| `make fund-wallet 0xAddr bread=N`      | Fund the wallet(s) with N BREAD only                 |
| `make mine`                            | Mine a single block                                  |
| `make timestamp`                       | Show current block timestamp                         |
| `make time-increase SECONDS=N`         | Advance Anvil time by N seconds                      |
| `make warp TIMESTAMP=N`                | Set Anvil time to a specific timestamp (future only) |
| `make time-reset`                      | Reset chain clock to system time (only if behind)    |

## Useful pnpm Commands

| Command              | Description                                     |
| -------------------- | ----------------------------------------------- |
| `pnpm dev`           | Dev server on `http://localhost:3001`           |
| `pnpm build`         | Production build — also the full type-check     |
| `pnpm lint`          | ESLint                                          |
| `pnpm format`        | Prettier write (`format:check` to verify only)  |
| `pnpm db:push:local` | Apply Supabase migrations to your local project |

## Custom Deployment

To deploy with custom parameters:

```bash
make deploy \
  RPC_URL=http://localhost:8545 \
  PRIVATE_KEY=0x... \
  ADMIN_ADDRESS=0x...
```

## Troubleshooting

### `___ Provide all CLIENT env variables ___` / `___ Provide all SERVER env variables ___`

A required entry in `.env.local` is missing or empty. The error lists the offending keys.
Client-side keys are validated in `src/lib/env.ts`, server-side ones in
`src/lib/envs/server.ts`. Restart the dev server after editing `.env.local`.

### Contract addresses not updating

Manually check the deployment file:

```bash
cat contracts/out/SAVING_CIRCLES_DEPLOYMENT.json
```

Then run:

```bash
make update-env
```

### `Error: contracts/out/SAVING_CIRCLES_DEPLOYMENT.json not found`

Nothing has been deployed yet in this session. Ensure `make anvil` is running in another
terminal, then run `make deploy`.

### Nonce issues after reset

If transactions fail with nonce errors after `anvil-reset`, run `make reset-nonces`. For
external wallets, also restart MetaMask or clear its activity data for the local network.

### `reset-supabase` refuses to run

It requires `NEXT_PUBLIC_NODE_ENV=local` in `.env.local`, plus
`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. This guard is intentional — it
stops the command from wiping a shared database.

### Migration push fails

`prepared statement "..." already exists` means `SUPABASE_DB_URL_LOCAL` points at the
transaction pooler (port `6543`); switch it to the session pooler (`5432`).
`Remote migration versions not found in local migrations directory` means the database has
migrations applied that your branch doesn't contain — usually another branch pushed to the
same project. Pull/merge that branch rather than running the suggested `migration repair`,
which would leave the recorded history disagreeing with the real schema.

### Port already in use

```bash
# For Anvil (8545), stop the existing process
lsof -ti:8545 | xargs kill -9

# For Next.js, use a different port
pnpm dev -- -p 3002
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Foundry Book](https://book.getfoundry.sh/)
- [Anvil Documentation](https://book.getfoundry.sh/anvil/)
- [Supabase Documentation](https://supabase.com/docs)
