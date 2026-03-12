import { NextRequest, NextResponse } from "next/server";
import {
  getAddress,
  isAddress,
  createPublicClient,
  createWalletClient,
  erc20Abi,
  Hex,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { serverEnv } from "@/lib/envs/server";

type FundRequestBody = {
  walletAddress?: string;
  chainId?: number;
};

const FUNDER_CHAIN_ID = 11155111;
const MIN_BALANCE_TO_SKIP_WEI = BigInt("20000000000000000000"); // 20 BREAD

function getConfig() {
  return {
    enabled: serverEnv.SEPOLIA_AUTO_FUND_ENABLED === "true",
    rpcUrl: serverEnv.SEPOLIA_RPC_URL,
    privateKey: serverEnv.SEPOLIA_FUNDER_PRIVATE_KEY,
    tokenAddress: serverEnv.NEXT_PUBLIC_SEPOLIA_BREAD_TOKEN_ADDRESS,
    amountWei: serverEnv.SEPOLIA_AUTO_FUND_AMOUNT_WEI,
  };
}

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  const cfg = getConfig();

  if (!cfg.enabled) {
    return badRequest("Sepolia auto-funding is disabled", 403);
  }

  if (!cfg.rpcUrl || !cfg.privateKey || !cfg.tokenAddress || !cfg.amountWei) {
    return badRequest(
      "Missing server funding configuration (RPC, key, token, amount)",
      500
    );
  }

  let body: FundRequestBody | null = null;
  try {
    body = (await request.json()) as FundRequestBody;
  } catch {
    return badRequest("Invalid JSON body");
  }

  const walletAddressInput = body?.walletAddress;
  const chainIdInput = body?.chainId ?? FUNDER_CHAIN_ID;

  if (!walletAddressInput || !isAddress(walletAddressInput)) {
    return badRequest("walletAddress is required and must be a valid address");
  }

  if (chainIdInput !== FUNDER_CHAIN_ID) {
    return badRequest("Only Sepolia chainId 11155111 is supported");
  }

  const walletAddress = getAddress(walletAddressInput);
  const tokenAddress = getAddress(cfg.tokenAddress);
  const amountWei = BigInt(cfg.amountWei);

  if (amountWei <= BigInt(0)) {
    return badRequest("SEPOLIA_AUTO_FUND_AMOUNT_WEI must be > 0", 500);
  }

  try {
    const account = privateKeyToAccount(cfg.privateKey as Hex);
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(cfg.rpcUrl),
    });

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(cfg.rpcUrl),
    });

    const currentBalance = (await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [walletAddress],
    })) as bigint;

    if (currentBalance >= amountWei) {
      return NextResponse.json({
        success: true,
        alreadyFunded: true,
        walletAddress,
        chainId: FUNDER_CHAIN_ID,
        tokenAddress,
        amountWei: amountWei.toString(),
        reason: "already_has_funding_amount",
      });
    }

    if (currentBalance >= MIN_BALANCE_TO_SKIP_WEI) {
      return NextResponse.json({
        success: true,
        alreadyFunded: true,
        walletAddress,
        chainId: FUNDER_CHAIN_ID,
        tokenAddress,
        amountWei: amountWei.toString(),
        reason: "balance_above_threshold",
        minBalanceToSkipWei: MIN_BALANCE_TO_SKIP_WEI.toString(),
      });
    }

    const txHash = await walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [walletAddress, amountWei],
      chain: sepolia,
      account,
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    return NextResponse.json({
      success: true,
      alreadyFunded: false,
      walletAddress,
      chainId: FUNDER_CHAIN_ID,
      tokenAddress,
      amountWei: amountWei.toString(),
      txHash,
      blockNumber: receipt.blockNumber.toString(),
    });
  } catch (error) {
    console.error("Sepolia embedded wallet funding failed:", error);
    return badRequest("Funding failed", 500);
  }
}
