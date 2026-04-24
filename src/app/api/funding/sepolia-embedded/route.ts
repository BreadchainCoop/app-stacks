import { NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
  parseEther,
  formatEther,
  type Address,
  type Hash,
  erc20Abi,
  fallback,
  Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { createErrorResponse } from "../../utils";
import { serverEnv } from "@/lib/envs/server";

const SEPOLIA_CHAIN_ID = 11155111;
const BREAD_TOKEN_ADDRESS =
  serverEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS as Address;

const BREAD_FUND_AMOUNT = parseEther("50");
const BREAD_MINIMUM_THRESHOLD = parseEther("20");

const ETH_TOP_UP_AMOUNT = parseEther("0.0005");
const ETH_MINIMUM_THRESHOLD = parseEther("0.0002");

interface FaucetResult {
  address: Address;
  eth: {
    balanceBefore: string;
    topped_up: boolean;
    txHash?: Hash;
    amountSent?: string;
    error?: string;
  };
  bread: {
    balanceBefore: string;
    topped_up: boolean;
    txHash?: Hash;
    amountSent?: string;
    error?: string;
  };
}

function normalizePrivateKey(privateKey: string): Hex | null {
  const trimmed = privateKey.trim();
  const withPrefix = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  return /^0x[0-9a-fA-F]{64}$/.test(withPrefix) ? (withPrefix as Hex) : null;
}

const transport = fallback([http(serverEnv.SEPOLIA_RPC_URL), http()]);

export async function POST(req: NextRequest) {
  if (serverEnv.NEXT_PUBLIC_CHAIN_ID !== SEPOLIA_CHAIN_ID) {
    return createErrorResponse("This is not demo chain", 500);
  }

  let body: { address?: string };

  try {
    body = await req.json();
  } catch {
    return createErrorResponse("Invalid JSON body");
  }

  const { address } = body;

  if (!address || !isAddress(address)) {
    return createErrorResponse("A valid EVM address is required.");
  }

  const recipient = address as Address;

  // const privateKey = serverEnv.AUTOMATIC_FUNDING_PRIVATE_KEY;
  const privateKey = normalizePrivateKey(
    serverEnv.AUTOMATIC_FUNDING_PRIVATE_KEY
  );
  if (!privateKey) {
    console.error("AUTOMATIC_FUNDING_PRIVATE_KEY is not configured");
    return createErrorResponse("Server error: Funder not configured", 500);
  }

  const funderAccount = privateKeyToAccount(privateKey as `0x${string}`);

  const publicClient = createPublicClient({ chain: sepolia, transport });
  const walletClient = createWalletClient({
    account: funderAccount,
    chain: sepolia,
    transport,
  });

  const result: FaucetResult = {
    address: recipient,
    eth: { balanceBefore: "", topped_up: false },
    bread: { balanceBefore: "", topped_up: false },
  };

  const [ethBalance, breadBalance, currentNonce] = await Promise.all([
    publicClient.getBalance({ address: recipient }),
    publicClient.readContract({
      address: BREAD_TOKEN_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [recipient],
    }),
    publicClient.getTransactionCount({
      address: funderAccount.address,
      blockTag: "pending",
    }),
  ]);

  result.eth.balanceBefore = `${formatEther(ethBalance)} ETH`;
  result.bread.balanceBefore = `${formatEther(breadBalance)} BREAD`;

  const topUpPromises: Promise<void>[] = [];
  let nextNonce = currentNonce;

  if (ethBalance < ETH_MINIMUM_THRESHOLD) {
    const ethPromise = (async () => {
      try {
        const txHash = await walletClient.sendTransaction({
          to: recipient,
          value: ETH_TOP_UP_AMOUNT,
          nonce: nextNonce++,
        });

        await publicClient.waitForTransactionReceipt({ hash: txHash });

        result.eth.topped_up = true;
        result.eth.txHash = txHash;
        result.eth.amountSent = `${formatEther(ETH_TOP_UP_AMOUNT)} ETH`;
      } catch (err) {
        console.error("ETH top-up failed:", err);
        result.eth.error = String(err);
      }
    })();

    topUpPromises.push(ethPromise);
  }

  if (breadBalance < BREAD_MINIMUM_THRESHOLD) {
    const breadPromise = (async () => {
      try {
        const txHash = await walletClient.writeContract({
          address: BREAD_TOKEN_ADDRESS,
          abi: erc20Abi,
          functionName: "transfer",
          args: [recipient, BREAD_FUND_AMOUNT],
          nonce: nextNonce++,
        });

        await publicClient.waitForTransactionReceipt({ hash: txHash });

        result.bread.topped_up = true;
        result.bread.txHash = txHash;
        result.bread.amountSent = `${formatEther(BREAD_FUND_AMOUNT)} BREAD`;
      } catch (err) {
        console.error("BREAD transfer failed:", err);
        result.bread.error = String(err);
      }
    })();

    topUpPromises.push(breadPromise);
  }

  if (topUpPromises.length > 0) await Promise.all(topUpPromises);

  return NextResponse.json(result, { status: 200 });
}
