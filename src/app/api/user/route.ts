import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "../utils";
import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/envs/server";
import type { Database } from "@/lib/supabase";

const supabaseAdmin = createClient<Database>(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
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
  privyUserId: string;
  markTransferred?: boolean;
  walletAddress?: string;
}

export async function PATCH(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return createErrorResponse("Invalid JSON in request body");
  }

  if (!body || typeof body !== "object") {
    return createErrorResponse("Invalid request body");
  }

  const { privyUserId, markTransferred, walletAddress } =
    body as UpdateUserRequestBody;

  if (!privyUserId || typeof privyUserId !== "string") {
    return createErrorResponse("privyUserId is required and must be a string");
  }

  const updates: {
    transferred_to_wallet_at?: string;
    wallet_address?: string;
  } = {};

  if (markTransferred)
    updates.transferred_to_wallet_at = new Date().toISOString();
  if (walletAddress && typeof walletAddress === "string") {
    updates.wallet_address = walletAddress;
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
