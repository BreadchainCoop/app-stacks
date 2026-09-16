import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { createPublicClient, fallback, http, type Address } from "viem";
import { serverEnv } from "@/lib/envs/server";
import { networks } from "@/utils/chain";
import { privyUserOwnsWallet } from "@/lib/privy-server";
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
