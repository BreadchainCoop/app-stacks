# Saving Circles dApp

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for smart contract development)
- [Git](https://git-scm.com/)
- A Web3 wallet (e.g., MetaMask) for testing

## Local Development Setup

### 1. Clone and Initialize

```bash
# Clone the repository
git clone <your-repo-url>
cd <your-repo-name>

# Update contract submodules
make update-contract-submodules
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

### 4. Start Local Blockchain

In a separate terminal, start Anvil (local Ethereum node):

```bash
make anvil
```

This will:

- Fork Gnosis Chain at the latest block
- Run on `http://localhost:8545`
- Use chain ID `31337`
- Mine blocks every 5 seconds

**Keep this terminal running** throughout your development session.

### 5. Deploy Contracts

In another terminal, deploy the smart contracts and start the development server:

```bash
make start-local
```

This will:

- Clear off-chain stack data in Supabase (`user_stacks`, `stacks_metadata`) so local dev starts from a clean slate — only runs when `NEXT_PUBLIC_NODE_ENV=local`
- Compile and deploy the contracts to your local Anvil instance
- Automatically update your `.env.local` with the deployed contract addresses
- Start the Next.js development server

**Deployer account**: `0xdcE4807F815737616B6150c5A483AeC83C4FC5a9` — a dedicated
throwaway key whose nonce is forced to 0 before every deploy, so the contracts always
land on the same addresses. Those addresses are baked into the app, which is what lets
the hosted demo site talk to your Anvil node (see "Demo local mode" below). `make
deploy` verifies them and fails loudly if they drift. The admin (and the account
`make fund-wallet` sends from) is still Anvil's first account,
`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`.

### 6. Configure MetaMask

Add the local network to MetaMask:

- **Network Name**: Anvil Local
- **RPC URL**: `http://localhost:8545`
- **Chain ID**: `31337`
- **Currency Symbol**: `ETH`

Import the default Anvil account for testing:

- **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

⚠️ **Never use this account on mainnet or with real funds!**

Open [http://localhost:3000](http://localhost:3000) to see your dApp.

## Demo local mode (no local setup)

The deployed dev/demo sites can run against **your** Anvil node instead of Sepolia, so
you can demo the full flow without waiting for real round intervals. Open the site,
pick **Demo local** in the popup, and you get:

- no login — a navbar dropdown switches between the 10 Anvil accounts
- a **Next round** button on the stack page that warps Anvil's clock past the deposit
  window (the in-app equivalent of `make warp`)
- stack creation with a single fixed interval, since rounds only advance via that button

The only prerequisite is a node with the contracts on it:

```bash
make anvil     # terminal 1
make deploy    # terminal 2
make fund-all  # give all 10 Anvil accounts xDAI + BREAD
```

No `.env.local`, no Supabase and no `pnpm install` needed — the contract addresses are
deterministic and already baked into the deployed bundle. Stack names and invite
tracking are kept in the browser's localStorage, so a link opened in a different
browser shows as `Stack <id>`.

Chrome or Edge only: other browsers block an https page from calling
`http://localhost:8545`. The mode is remembered, and the navbar chip switches back to
Demo Sepolia at any time. Production never shows the popup.

## Development Workflow

### Updating Contract Submodules

If the contract submodules are out of date, update them and redeploy:

```bash
make update-contract-submodules
make anvil-reset
make start-local
```

### Resetting the Local Blockchain

`make anvil-reset` rewinds the fork, but it does **not** clear code that was already
deployed. Since `make deploy` uses a fixed deployer nonce, redeploying onto a node that
still has the contracts fails with a "contracts are already deployed" error. For a
genuinely fresh state, stop `make anvil` (Ctrl-C) and start it again:

```bash
make anvil        # terminal 1, restarted
make start-local  # terminal 2
```

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

### Time Manipulation (for testing)

Use the Makefile commands to manipulate Anvil's block timestamp directly — no system clock changes needed.

**To jump to a specific timestamp:**

```bash
make warp TIMESTAMP=1735689600   # January 1, 2025 00:00:00 UTC
```

**To advance time by a number of seconds:**

```bash
make time-increase SECONDS=86400   # advance by 1 day
```

> ⚠️ **Important:** Anvil's clock only moves forward. Once a block has been mined at a given timestamp, you cannot go back to an earlier one. To start fresh, restart Anvil with `make anvil-reset`.

**Typical workflow for time-based testing:**

1. `make time-increase SECONDS=2592000` to jump 30 days ahead
2. Interact with contracts as needed
3. Advance further with another `make time-increase` or jump to a precise moment with `make warp`

```bash
make mine                          # Mine a single block
make timestamp                     # Show current block timestamp
make time-increase SECONDS=86400   # Advance time by 1 day
make warp TIMESTAMP=1735689600     # Jump to a specific timestamp (January 1, 2025 00:00:00 UTC)
```

## Useful Make Commands

| Command                                | Description                                       |
| -------------------------------------- | ------------------------------------------------- |
| `make anvil`                           | Start local blockchain (Gnosis fork)              |
| `make start-local`                     | Clear off-chain data, deploy contracts, start dev |
| `make deploy`                          | Deploy contracts and update .env.local            |
| `make check-deployment`                | Verify the deterministic local addresses          |
| `make fund-all`                        | Fund all 10 Anvil accounts with xDAI and BREAD    |
| `make reset-supabase`                  | Wipe off-chain stack data (local env only)        |
| `make anvil-reset`                     | Reset blockchain to fresh state                   |
| `make update-contract-submodules`      | Update contract dependencies                      |
| `make fund-wallet 0xAddr [0xAddr ...]` | Fund one or more wallets with ETH and BREAD       |
| `make fund-wallet 0xAddr eth=N`        | Fund the wallet(s) with N ETH only                |
| `make fund-wallet 0xAddr bread=N`      | Fund the wallet(s) with N BREAD only              |
| `make mine`                            | Mine a single block                               |
| `make timestamp`                       | Show current block timestamp                      |
| `make time-increase SECONDS=N`         | Advance Anvil time by N seconds                   |
| `make warp TIMESTAMP=N`                | Set Anvil time to a specific timestamp            |

## Custom Deployment

To deploy with custom parameters:

```bash
make deploy \
  RPC_URL=http://localhost:8545 \
  LOCAL_DEPLOYER_PK=0x... \
  ADMIN_ADDRESS=0x...
```

Overriding `LOCAL_DEPLOYER_PK` changes the deployed addresses, so `check-deployment`
will fail — expected for a one-off deploy, but Demo local mode won't find the
contracts. `PRIVATE_KEY` is the account `make fund-wallet` sends from.

## Troubleshooting

### Contract addresses not updating

Manually check the deployment file:

```bash
cat contracts/out/SAVING_CIRCLES_DEPLOYMENT.json
```

Then run:

```bash
make update-env
```

### Nonce issues after reset

If transactions fail with nonce errors after `anvil-reset`, restart MetaMask or clear its activity data for the local network.

### Port already in use

If port 8545 or 3000 is already in use:

```bash
# For Anvil, stop the existing process
lsof -ti:8545 | xargs kill -9

# For Next.js, use a different port
npm run dev -- -p 3001
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Foundry Book](https://book.getfoundry.sh/)
- [Anvil Documentation](https://book.getfoundry.sh/anvil/)
