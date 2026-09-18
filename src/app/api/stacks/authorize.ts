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

const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

const SEPOLIA_CHAIN_ID = 11155111;

export const getPublicClient = () => {
  const chain =
    networks[serverEnv.NEXT_PUBLIC_CHAIN_ID as keyof typeof networks].chain;

  const transport =
    chain.id === SEPOLIA_CHAIN_ID
      ? fallback([http(serverEnv.SEPOLIA_RPC_URL), http()])
      : http();

  return createPublicClient({ chain, transport });
};

const SAVING_CIRCLES_CONTRACT_ADDRESS =
  serverEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS as Address;
const GOAL_SAVINGS_CONTRACT_ADDRESS =
  serverEnv.NEXT_PUBLIC_GOAL_SAVINGS_CONTRACT_ADDRESS as Address;

/**
 * The on-chain owner of a stack, read from the contract behind its type.
 * `stackId` is a stacks_metadata id (bare for ROSCA, `goal:<id>` for goals).
 */
export const getStackOwner = async (stackId: string): Promise<Address> => {
  const parsed = parseStackMetadataId(stackId);
  if (!parsed) throw new Error(`Invalid stack id: ${stackId}`);

  const id = BigInt(parsed.onChainId);
  const publicClient = getPublicClient();

  if (parsed.type === "goal") {
    const goal = await publicClient.readContract({
      address: GOAL_SAVINGS_CONTRACT_ADDRESS,
      abi: goalSavingCirclesAbi,
      functionName: "getGoal",
      args: [id],
    });

    return goal.owner;
  }

  const circle = await publicClient.readContract({
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    abi: savingCirclesAbi,
    functionName: "getCircle",
    args: [id],
  });

  return circle.owner;
};

/** Whether `wallet` is a member of the stack on the contract behind its type. */
export const isStackMember = async (
  stackId: string,
  wallet: Address
): Promise<boolean> => {
  const parsed = parseStackMetadataId(stackId);
  if (!parsed) throw new Error(`Invalid stack id: ${stackId}`);

  const id = BigInt(parsed.onChainId);
  const publicClient = getPublicClient();

  if (parsed.type === "goal") {
    return publicClient.readContract({
      address: GOAL_SAVINGS_CONTRACT_ADDRESS,
      abi: goalSavingCirclesAbi,
      functionName: "isMember",
      args: [id, wallet],
    });
  }

  return publicClient.readContract({
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
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
