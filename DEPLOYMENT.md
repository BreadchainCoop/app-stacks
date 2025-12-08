# Stacks Contract Deployment Guide

This guide explains how to deploy the Stacks (Saving Circles) contract to a local Anvil server.

## Prerequisites

1. **Foundry/Forge installed** - The deployment script uses Foundry's forge-std
2. **Anvil running locally** - Start your local Anvil node
3. **Environment variables set** - You'll need a `PRIVATE_KEY` environment variable

## Contract Information

- **Gnosis Chain Address**: `0x55F1D6b75C70890a464b6e7D99881707643d6eC5`
- **ABI Location**: `/contracts/Stacks/abi.json`
- **Contract Type**: Saving Circles implementation

## Deployment Steps

### 1. Start Anvil

```bash
# Start Anvil on default port 8545
anvil

# Or start with specific configuration
anvil --host 0.0.0.0 --port 8545 --chain-id 31337
```

### 2. Set Environment Variables

```bash
# Set your private key (use one of the Anvil default accounts)
export PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
```

### 3. Deploy the Contract

```bash
# Basic deployment
forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast

# Deploy with verification
forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast --verify

# Deploy with specific owner
forge script script/Deploy.s.sol:DeployScript --sig "deployWithOwner(address)" 0xYourOwnerAddress --rpc-url http://localhost:8545 --broadcast
```

### 4. Deploy for Testing

```bash
# Deploy with a test token allowed
forge script script/Deploy.s.sol:DeployScript --sig "deployForTesting(address)" 0xYourTestTokenAddress --rpc-url http://localhost:8545 --broadcast
```

## Script Features

The deployment script includes:

- ✅ **Automatic initialization** - Contract is initialized with deployer as owner
- ✅ **Deployment verification** - Checks contract state after deployment
- ✅ **Comprehensive logging** - Shows contract address, owner, and key parameters
- ✅ **Event emission** - Emits events for deployment tracking
- ✅ **Helper functions** - Additional deployment options for testing

## Expected Output

```
=== Stacks Contract Deployment ===
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Deployer Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Chain ID: 31337
Block Number: 1
Gas Used for Deployment: 1234567
✓ Contract owner verified
✓ Contract state verified
✓ Deployment successful
=== Deployment Complete ===
Stacks contract successfully deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Contract owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Next ID: 0
Minimum members required: 2
```

## Contract Functions Available

After deployment, the contract supports:

- `create()` - Create new saving circles
- `deposit()` - Deposit funds to circles
- `withdraw()` - Withdraw funds from circles
- `setTokenAllowed()` - Allow/disallow tokens
- `getCircle()` - Get circle information
- `isMember()` - Check membership status

## Troubleshooting

### Common Issues

1. **"No private key found"** - Make sure `PRIVATE_KEY` environment variable is set
2. **"Anvil not running"** - Start Anvil with `anvil` command
3. **"Contract not found"** - Ensure the Stacks contract is in `/contracts/Stacks.sol`

### Verification

To verify the deployment worked:

```bash
# Check contract owner
cast call <CONTRACT_ADDRESS> "owner()" --rpc-url http://localhost:8545

# Check next ID
cast call <CONTRACT_ADDRESS> "nextId()" --rpc-url http://localhost:8545

# Check minimum members
cast call <CONTRACT_ADDRESS> "MINIMUM_MEMBERS()" --rpc-url http://localhost:8545
```

## Next Steps

After successful deployment:

1. **Update your frontend** - Use the new contract address in your app
2. **Configure tokens** - Allow specific tokens using `setTokenAllowed()`
3. **Test functionality** - Create test circles and verify operations
4. **Deploy to testnet** - Use similar process for testnet deployment

