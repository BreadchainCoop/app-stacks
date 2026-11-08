import { NextRequest, NextResponse } from "next/server";
import { getAddress, isAddress } from "viem";
import { createErrorResponse, verifyPrivyToken } from "../utils";
import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/envs/server";
import type { Database } from "@/lib/supabase";
import { privyUserOwnsWallet } from "@/lib/privy-server";

const supabaseAdmin = createClient<Database>(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SECRET_KEY
);

export async function GET(req: NextRequest) {
  const privyUserId = req.nextUrl.searchParams.get("privyUserId");

  if (!privyUserId) return createErrorResponse("privyUserId is required");

  // The alias comes back with the id: it's public either way (anon can read
  // profiles), and callers always want both, so this saves a round-trip.
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, profiles(username)")
    .eq("privy_user_id", privyUserId)
    .single();

  if (error || !data) return createErrorResponse("User not found", 404);

  return NextResponse.json({
    id: data.id,
    username: data.profiles?.username ?? null,
  });
}

interface UpdateUserRequestBody {
  markTransferred?: boolean;
  walletAddress?: string;
}

/**
 * Records the embedded → linked wallet move (migrate-and-transfer).
 *
 * The row is the caller's own, taken from their Privy token, never the body.
 * `wallet_address` is what callerOwnsWallet trusts as proof of ownership and
 * what /api/users/search returns for a username, so it may only be set to a
 * wallet Privy confirms the caller owns.
 */
export async function PATCH(req: NextRequest) {
  const privyUserId = await verifyPrivyToken(req);
  if (!privyUserId) return createErrorResponse("Unauthorized", 401);

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return createErrorResponse("Invalid JSON in request body");
  }

  if (!body || typeof body !== "object") {
    return createErrorResponse("Invalid request body");
  }

  const { markTransferred, walletAddress } = body as UpdateUserRequestBody;

  const updates: {
    transferred_to_wallet_at?: string;
    wallet_address?: string;
  } = {};

  if (markTransferred)
    updates.transferred_to_wallet_at = new Date().toISOString();

  if (walletAddress !== undefined) {
    if (typeof walletAddress !== "string" || !isAddress(walletAddress)) {
      return createErrorResponse("walletAddress must be a valid address");
    }

    if (!(await privyUserOwnsWallet(privyUserId, walletAddress))) {
      return createErrorResponse(
        "walletAddress must be a wallet linked to your account",
        403
      );
    }

    updates.wallet_address = getAddress(walletAddress);
  }

  if (Object.keys(updates).length === 0) {
    return createErrorResponse(
      "At least one of markTransferred, walletAddress is required"
    );
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("privy_user_id", privyUserId);

  if (error) {
    console.error("Failed to update user:", error);
    return createErrorResponse("Failed to update user", 500);
  }

  return NextResponse.json({ success: true });
}
