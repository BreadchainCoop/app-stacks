import { serverEnv } from "@/lib/envs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse, verifyPrivyToken } from "../../utils";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { networks } from "@/utils/network";
import { createPublicClient, fallback, http, type Address } from "viem";

const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

const SAVING_CIRCLES_CONTRACT_ADDRESS =
  serverEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS as Address;

const SEPOLIA_CHAIN_ID = 11155111;

const getPublicClient = () => {
  const chain =
    networks[serverEnv.NEXT_PUBLIC_CHAIN_ID as keyof typeof networks].chain;

  const transport =
    chain.id === SEPOLIA_CHAIN_ID
      ? fallback([http(serverEnv.SEPOLIA_RPC_URL), http()])
      : http();

  return createPublicClient({ chain, transport });
};

/**
 * Verifies the caller is actually the circle's owner: their Privy token
 * resolves to a `users` row whose stored wallet_address matches
 * `ownerAddress`. Never trust a client-supplied address for this - a
 * circle's owner is public, so anyone could otherwise claim to be it.
 */
const isVerifiedOwner = async (req: NextRequest, ownerAddress: Address) => {
  const privyUserId = await verifyPrivyToken(req);
  if (!privyUserId) return false;

  const { data: callerUser } = await supabaseAdmin
    .from("users")
    .select("wallet_address")
    .eq("privy_user_id", privyUserId)
    .maybeSingle();

  return (
    !!callerUser?.wallet_address &&
    callerUser.wallet_address.toLowerCase() === ownerAddress.toLowerCase()
  );
};

interface CreateJoinRequestBody {
  circleId: string;
  walletAddress: string;
}

export async function POST(req: NextRequest) {
  try {
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

    const { circleId, walletAddress } = body as CreateJoinRequestBody;

    if (!circleId || typeof circleId !== "string") {
      return createErrorResponse("circleId is required and must be a string");
    }

    if (!walletAddress || typeof walletAddress !== "string") {
      return createErrorResponse(
        "walletAddress is required and must be a string"
      );
    }

    const { data: user, error: userFetchError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("privy_user_id", privyUserId)
      .single();

    if (userFetchError || !user) {
      console.error("Failed to fetch user:", userFetchError);
      return createErrorResponse("Failed to find user", 404);
    }

    const { data: existing, error: existingFetchError } = await supabaseAdmin
      .from("join_requests")
      .select("id, status")
      .eq("stack_id", circleId)
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    if (existingFetchError) {
      console.error("Failed to fetch join request:", existingFetchError);
      return createErrorResponse("Failed to save join request", 500);
    }

    if (!existing) {
      const { error: insertError } = await supabaseAdmin
        .from("join_requests")
        .insert({
          stack_id: circleId,
          user_id: user.id,
          wallet_address: walletAddress,
        });

      if (insertError) {
        console.error("Failed to insert join request:", insertError);
        return createErrorResponse("Failed to save join request", 500);
      }

      return NextResponse.json({ success: true, status: "pending" });
    }

    if (existing.status === "added") {
      return NextResponse.json({ success: true, status: existing.status });
    }

    const { error: updateError } = await supabaseAdmin
      .from("join_requests")
      .update({ status: "pending" })
      .eq("id", existing.id);

    if (updateError) {
      console.error("Failed to update join request:", updateError);
      return createErrorResponse("Failed to save join request", 500);
    }

    return NextResponse.json({ success: true, status: "pending" });
  } catch (err) {
    console.error("Create join request endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const circleId = req.nextUrl.searchParams.get("circleId");
    const requesterWalletAddress = req.nextUrl.searchParams.get(
      "requesterWalletAddress"
    );

    if (!circleId) {
      return createErrorResponse("circleId is required");
    }

    if (!requesterWalletAddress) {
      return createErrorResponse("requesterWalletAddress is required");
    }

    const publicClient = getPublicClient();

    const circle = await publicClient.readContract({
      address: SAVING_CIRCLES_CONTRACT_ADDRESS,
      abi: savingCirclesAbi,
      functionName: "getCircle",
      args: [BigInt(circleId)],
    });

    const isOwner = await isVerifiedOwner(req, circle.owner);

    // Anyone can check their own request status — this doesn't leak anyone
    // else's. Only the verified owner gets the full pending list below.
    const { data: ownRequest, error: ownRequestError } = await supabaseAdmin
      .from("join_requests")
      .select("status")
      .eq("stack_id", circleId)
      .eq("wallet_address", requesterWalletAddress)
      .maybeSingle();

    if (ownRequestError) {
      console.error("Failed to fetch own join request:", ownRequestError);
      return createErrorResponse("Failed to fetch join request status", 500);
    }

    const ownRequestStatus = ownRequest?.status ?? null;

    if (!isOwner) {
      return NextResponse.json({
        success: true,
        requests: [],
        ownRequestStatus,
      });
    }

    const { data: requests, error: fetchError } = await supabaseAdmin
      .from("join_requests")
      .select("id, wallet_address, created_at")
      .eq("stack_id", circleId)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Failed to fetch join requests:", fetchError);
      return createErrorResponse("Failed to fetch join requests", 500);
    }

    return NextResponse.json({
      success: true,
      requests: requests ?? [],
      ownRequestStatus,
    });
  } catch (err) {
    console.error("List join requests endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}

interface DecideJoinRequestBody {
  requestId: string;
  status: "added" | "dismissed";
}

export async function PATCH(req: NextRequest) {
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

    const { requestId, status } = body as DecideJoinRequestBody;

    if (!requestId || typeof requestId !== "string") {
      return createErrorResponse("requestId is required and must be a string");
    }

    if (status !== "added" && status !== "dismissed") {
      return createErrorResponse('status must be "added" or "dismissed"');
    }

    const { data: joinRequest, error: fetchError } = await supabaseAdmin
      .from("join_requests")
      .select("stack_id, user_id, wallet_address")
      .eq("id", requestId)
      .single();

    if (fetchError || !joinRequest) {
      console.error("Failed to fetch join request:", fetchError);
      return createErrorResponse("Join request not found", 404);
    }

    const publicClient = getPublicClient();

    const circle = await publicClient.readContract({
      address: SAVING_CIRCLES_CONTRACT_ADDRESS,
      abi: savingCirclesAbi,
      functionName: "getCircle",
      args: [BigInt(joinRequest.stack_id)],
    });

    if (!(await isVerifiedOwner(req, circle.owner))) {
      return createErrorResponse("Only the circle owner can do this", 403);
    }

    if (status === "added") {
      const isMember = await publicClient.readContract({
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
        abi: savingCirclesAbi,
        functionName: "isMember",
        args: [
          BigInt(joinRequest.stack_id),
          joinRequest.wallet_address as Address,
        ],
      });

      if (!isMember) {
        return createErrorResponse(
          "This wallet is not yet a member on-chain",
          409
        );
      }

      const { error: userStackError } = await supabaseAdmin
        .from("user_stacks")
        .upsert(
          { user_id: joinRequest.user_id, stack_id: joinRequest.stack_id },
          { onConflict: "user_id,stack_id", ignoreDuplicates: true }
        );

      if (userStackError) {
        console.error("Failed to insert user_stacks:", userStackError);
        return createErrorResponse("Failed to save user stack", 500);
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from("join_requests")
      .update({ status })
      .eq("id", requestId);

    if (updateError) {
      console.error("Failed to update join request:", updateError);
      return createErrorResponse("Failed to update join request", 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Decide join request endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
