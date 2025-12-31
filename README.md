This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Update submodules to the latest

```bash
git submodule sync --recursive
git submodule update --init --recursive
git submodule update --remote --merge
```

Compile the contracts

```bash
cd contracts

export RPC_URL=http://localhost:8545
export PRIVATE_KEY=<your_local_dev_private_key>
export ADMIN_ADDRESS=<admin_address_for_saving_circles>

forge script script/Deploy.s.sol:Deploy \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --legacy
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
