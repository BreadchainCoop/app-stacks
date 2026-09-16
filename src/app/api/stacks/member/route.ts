import { serverEnv } from "@/lib/envs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { isAddress, type Address } from "viem";
import { createErrorResponse } from "../../utils";
import { callerOwnsWallet, getPublicClient } from "../authorize";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";

const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

const SAVING_CIRCLES_CONTRACT_ADDRESS =
  serverEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS as Address;

interface RemoveMemberRequestBody {
  circleId: string;
  walletAddress: string;
}

/**
 * Clears a removed member's dashboard link after the on-chain removal.
 *
 * Authorized to the same people `SavingCircles.removeMember` allows: the
 * circle's owner, or the member dropping themselves. Without that check any
 * caller could delete anyone's stack from their dashboard, since circle
 * members are public on-chain.
 */
export async function DELETE(req: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return createErrorResponse("Invalid JSON in request body");
    }

    if (!body || typeof body !== "object") {
      return createErrorResponse("Invalid request body");
    }

    const { circleId, walletAddress } = body as RemoveMemberRequestBody;

    if (!circleId || typeof circleId !== "string") {
      return createErrorResponse("circleId is required and must be a string");
    }

    if (!walletAddress || !isAddress(walletAddress)) {
      return createErrorResponse(
        "walletAddress is required and must be an address"
      );
    }

    const circle = await getPublicClient().readContract({
      address: SAVING_CIRCLES_CONTRACT_ADDRESS,
      abi: savingCirclesAbi,
      functionName: "getCircle",
      args: [BigInt(circleId)],
    });

    const authorized =
      (await callerOwnsWallet(req, circle.owner)) ||
      (await callerOwnsWallet(req, walletAddress));

    if (!authorized) {
      return createErrorResponse(
        "Only the circle owner or the member themselves can do this",
        403
      );
    }

    // Case-insensitive: addresses are stored as the client sent them, so a
    // checksummed address and its lowercase form must find the same row.
    const { data: user, error: userFetchError } = await supabaseAdmin
      .from("users")
      .select("id")
      .ilike("wallet_address", walletAddress)
      .maybeSingle();

    if (userFetchError) {
      console.error("Failed to fetch user:", userFetchError);
      return createErrorResponse("Failed to remove member", 500);
    }

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const { error: deleteError } = await supabaseAdmin
      .from("user_stacks")
      .delete()
      .eq("user_id", user.id)
      .eq("stack_id", circleId);

    if (deleteError) {
      console.error("Failed to delete user_stacks row:", deleteError);
      return createErrorResponse("Failed to remove member", 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Remove member endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
