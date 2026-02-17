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
# Install frontend dependencies
npm install
# or
yarn install
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

In another terminal, deploy the smart contracts to your local network:

```bash
make deploy
```

This will:

- Compile the contracts
- Deploy them to your local Anvil instance
- Automatically update your `.env.local` with the deployed contract addresses

**Default deployer account**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (Anvil's first account)

### 6. Configure MetaMask

Add the local network to MetaMask:

- **Network Name**: Anvil Local
- **RPC URL**: `http://localhost:8545`
- **Chain ID**: `31337`
- **Currency Symbol**: `ETH`

Import the default Anvil account for testing:

- **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

⚠️ **Never use this account on mainnet or with real funds!**

### 7. Start the Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your dApp.

## Development Workflow

### Updating Contract Submodules

If the contract submodules are out of date, update them and redeploy:

```bash
make update-contract-submodules
make anvil-reset
make deploy
```

### Resetting the Local Blockchain

If you need a fresh state:

```bash
make anvil-reset
```

Then redeploy:

```bash
make deploy
```

### Time Manipulation (for testing)

Anvil derives its block timestamps from your **machine's system clock**. To simulate future dates and test time-dependent contract logic, you need to manually set your machine's date and time to a future value.

**To move time forward:**

1. Change your machine's system date/time to the desired future date.
2. Mine a new block so Anvil picks up the new timestamp:

```bash
make mine
```

3. Verify the new timestamp:

```bash
make timestamp
```

> ⚠️ **Important:** Anvil only moves time forward. If you set your machine's clock back to the present (or any earlier time), Anvil will **not** reflect that change — it will continue using the last recorded timestamp. To work around this, always set your system clock to a time _further in the future_ than the last block's timestamp, never backwards.

**Typical workflow for time-based testing:**

1. Set system clock → future date (e.g. 30 days ahead)
2. `make mine` to produce a block at that timestamp
3. Interact with contracts as needed
4. To advance further, set system clock to an even later date and repeat

**To return to normal development**, restart Anvil (`make anvil-reset`) after resetting your system clock — the reset will start a fresh chain anchored to the current block timestamp of the Gnosis fork.

```bash
make mine          # Mine a single block
make timestamp     # Show current block timestamp
```

## Useful Make Commands

| Command                           | Description                            |
| --------------------------------- | -------------------------------------- |
| `make anvil`                      | Start local blockchain (Gnosis fork)   |
| `make deploy`                     | Deploy contracts and update .env.local |
| `make anvil-reset`                | Reset blockchain to fresh state        |
| `make update-contract-submodules` | Update contract dependencies           |
| `make mine`                       | Mine a single block                    |
| `make timestamp`                  | Show current block timestamp           |

## Custom Deployment

To deploy with custom parameters:

```bash
make deploy \
  RPC_URL=http://localhost:8545 \
  PRIVATE_KEY=0x... \
  ADMIN_ADDRESS=0x...
```

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
