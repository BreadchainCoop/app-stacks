import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { createPublicClient, fallback, http, type Address } from "viem";
import { serverEnv } from "@/lib/envs/server";
import { networks } from "@/utils/chain";
import { privyUserOwnsWallet } from "@/lib/privy-server";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { goalSavingCirclesAbi } from "@/lib/abis/goal-saving-circles";
import { parseStackMetadataId } from "@/lib/stack-types";
import { verifyUserToken } from "../utils";
import { getServerChainConfig } from "@/lib/envs/server-chains";

const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

const SEPOLIA_CHAIN_ID = 11155111;

export const getPublicClient = (chainId: number) => {
  const chain = networks[chainId as keyof typeof networks].chain;

  const transport =
    chain.id === SEPOLIA_CHAIN_ID
      ? fallback([http(serverEnv.SEPOLIA_RPC_URL), http()])
      : http();

  return createPublicClient({ chain, transport });
};

/**
 * The on-chain owner of a stack, read from the contract behind its type.
 * `stackId` is a stacks_metadata id (bare for ROSCA, `goal:<id>` for goals).
 *
 * `chainId` must be the same chain the caller then reads or writes rows for.
 * The contracts live at different addresses per chain, so resolving it twice
 * risks checking ownership on one chain and acting on another.
 */
export const getStackOwner = async (
  stackId: string,
  chainId: number
): Promise<Address> => {
  const parsed = parseStackMetadataId(stackId);
  if (!parsed) throw new Error(`Invalid stack id: ${stackId}`);

  const id = BigInt(parsed.onChainId);
  const publicClient = getPublicClient(chainId);
  const { savingCircles, goalSavings } = getServerChainConfig(chainId);

  if (parsed.type === "goal") {
    const goal = await publicClient.readContract({
      address: goalSavings,
      abi: goalSavingCirclesAbi,
      functionName: "getGoal",
      args: [id],
    });

    return goal.owner;
  }

  const circle = await publicClient.readContract({
    address: savingCircles,
    abi: savingCirclesAbi,
    functionName: "getCircle",
    args: [id],
  });

  return circle.owner;
};

/** Whether `wallet` is a member of the stack on the contract behind its type. */
export const isStackMember = async (
  stackId: string,
  wallet: Address,
  chainId: number
): Promise<boolean> => {
  const parsed = parseStackMetadataId(stackId);
  if (!parsed) throw new Error(`Invalid stack id: ${stackId}`);

  const id = BigInt(parsed.onChainId);
  const publicClient = getPublicClient(chainId);
  const { savingCircles, goalSavings } = getServerChainConfig(chainId);

  if (parsed.type === "goal") {
    return publicClient.readContract({
      address: goalSavings,
      abi: goalSavingCirclesAbi,
      functionName: "isMember",
      args: [id, wallet],
    });
  }

  return publicClient.readContract({
    address: savingCircles,
    abi: savingCirclesAbi,
    functionName: "isMember",
    args: [id, wallet],
  });
};

/**
 * Whether the request's bearer token belongs to the owner of `address`.
 *
 * Never trust a client-supplied address for authorization — on-chain owners
 * and members are public, so anyone could claim to be one.
 *
 * `users.wallet_address` caches a single address, but a Privy account can hold
 * several (embedded plus any linked external), and the one acting on-chain may
 * be either. A miss on the cache therefore falls back to Privy, the authority
 * on which wallets an account owns.
 */
export const callerOwnsWallet = async (
  req: NextRequest,
  address: Address
): Promise<boolean> => {
  const privyUserId = await verifyUserToken(req);
  if (!privyUserId) return false;

  const { data: callerUser } = await supabaseAdmin
    .from("users")
    .select("wallet_address")
    .eq("privy_user_id", privyUserId)
    .maybeSingle();

  if (!callerUser) return false;

  if (
    callerUser.wallet_address &&
    callerUser.wallet_address.toLowerCase() === address.toLowerCase()
  ) {
    return true;
  }

  return privyUserOwnsWallet(privyUserId, address);
};
