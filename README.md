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

Add the following variables to `.env.local`:
```env
# These will be auto-populated after contracts deployment
NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS=
NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS=
NEXT_PUBLIC_BREAD_TOKEN_ADDRESS=

# Local development RPC
NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK=0
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_NODE_ENV=local
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
```bash
# Mine a new block
make mine

# Check current block timestamp
make timestamp

# Fast forward time by X seconds (e.g., 1 day = 86400 seconds)
make time-increase SECONDS=86400

# Jump to a specific Unix timestamp
make warp TIMESTAMP=1735689600

# Reset to current time
make time-reset
```

## Useful Make Commands

| Command | Description |
|---------|-------------|
| `make anvil` | Start local blockchain (Gnosis fork) |
| `make deploy` | Deploy contracts and update .env.local |
| `make anvil-reset` | Reset blockchain to fresh state |
| `make update-contract-submodules` | Update contract dependencies |
| `make mine` | Mine a single block |
| `make timestamp` | Show current block timestamp |
| `make time-increase SECONDS=X` | Fast forward time by X seconds |
| `make warp TIMESTAMP=X` | Set next block to specific timestamp |
| `make time-reset` | Reset to current system time |

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
