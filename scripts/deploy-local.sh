#!/bin/bash

# Deploy to local Anvil and update contract address
echo "🚀 Deploying SavingCircles to local Anvil..."

# Deploy the contract
cd contracts
forge script script/DeployAndUpdate.s.sol:DeployAndUpdate --broadcast --rpc-url http://localhost:8545 --private-key 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6 --legacy

# Extract the contract address from the broadcast file
CONTRACT_ADDRESS=$(cat broadcast/DeployAndUpdate.s.sol/31337/run-latest.json | grep -o '"contractAddress": "[^"]*"' | cut -d'"' -f4)

if [ -n "$CONTRACT_ADDRESS" ]; then
    echo "✅ Contract deployed at: $CONTRACT_ADDRESS"
    
    # Update the contract address in the constants file
    cd ../src/constants
    sed -i.bak "s/local: \"[^\"]*\"/local: \"$CONTRACT_ADDRESS\"/" contract.ts
    rm contract.ts.bak
    
    echo "📝 Updated contract.ts with new address: $CONTRACT_ADDRESS"
    echo "🔄 Restart your dev server to use the new contract address"
else
    echo "❌ Failed to extract contract address"
    exit 1
fi




