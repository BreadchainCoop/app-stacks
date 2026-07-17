import { serverEnv } from "@/lib/envs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "../../utils";
import {
  Database,
  JoinRequestInviteLink,
  SupabaseInviteLink,
} from "@/lib/supabase";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { getServerPublicClient } from "@/lib/server-viem-client";
import { recoverTypedDataAddress, type Address } from "viem";

const supabaseAdmin = createClient<Database>(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

const SAVING_CIRCLES_CONTRACT_ADDRESS =
  serverEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS as Address;

const INVITE_DOMAIN_NAME = "StacksInvite";
const INVITE_DOMAIN_VERSION = "1";

const recoverInviteSigner = ({
  chainId,
  circleId,
  nonce,
  signature,
}: {
  chainId: number;
  circleId: bigint;
  nonce: bigint;
  signature: `0x${string}`;
}) =>
  recoverTypedDataAddress({
    domain: {
      name: INVITE_DOMAIN_NAME,
      version: INVITE_DOMAIN_VERSION,
      chainId,
      verifyingContract: SAVING_CIRCLES_CONTRACT_ADDRESS,
    },
    types: {
      Invite: [
        { name: "id", type: "uint256" },
        { name: "nonce", type: "uint256" },
      ],
    },
    primaryType: "Invite",
    message: {
      id: circleId,
      nonce,
    },
    signature,
  });

async function getUserByPrivyId(privyUserId: string) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, wallet_address")
    .eq("privy_user_id", privyUserId)
    .single();

  if (error || !data) return null;

  return data;
}

async function getCircleOwner(circleId: bigint) {
  const publicClient = getServerPublicClient();

  try {
    const circle = await publicClient.readContract({
      address: SAVING_CIRCLES_CONTRACT_ADDRESS,
      abi: savingCirclesAbi,
      functionName: "getCircle",
      args: [circleId],
    });

    return circle.owner;
  } catch (err) {
    console.error(
      `getCircleOwner(${circleId}) failed against ${SAVING_CIRCLES_CONTRACT_ADDRESS} on chain ${serverEnv.NEXT_PUBLIC_CHAIN_ID}:`,
      err
    );
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return createErrorResponse("Invalid request body");
    }

    const { circleId, privyUserId } = body as {
      circleId?: string;
      privyUserId?: string;
    };

    if (!circleId || typeof circleId !== "string") {
      return createErrorResponse("circleId is required and must be a string");
    }

    if (!privyUserId || typeof privyUserId !== "string") {
      return createErrorResponse(
        "privyUserId is required and must be a string"
      );
    }

    const user = await getUserByPrivyId(privyUserId);

    if (!user || !user.wallet_address) {
      return createErrorResponse(
        "No onboarded wallet found for this user",
        404
      );
    }

    const parsedId = BigInt(circleId);
    const owner = await getCircleOwner(parsedId);

    if (!owner) {
      return createErrorResponse("This stack does not exist", 404);
    }

    const publicClient = getServerPublicClient();
    const [isMember, isActive] = await Promise.all([
      publicClient.readContract({
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
        abi: savingCirclesAbi,
        functionName: "isMember",
        args: [parsedId, user.wallet_address as `0x${string}`],
      }),
      publicClient.readContract({
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
        abi: savingCirclesAbi,
        functionName: "isActive",
        args: [parsedId],
      }),
    ]);

    if (isMember) {
      return createErrorResponse("You are already a member of this stack");
    }

    if (isActive) {
      return createErrorResponse("This stack has already launched");
    }

    const { data: existing } = await supabaseAdmin
      .from("join_requests")
      .select("*")
      .eq("stack_id", circleId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing && existing.status !== "rejected") {
      return NextResponse.json({ success: true, request: existing });
    }

    const row: Database["public"]["Tables"]["join_requests"]["Insert"] = {
      stack_id: circleId,
      user_id: user.id,
      wallet_address: user.wallet_address,
      status: "pending",
      invite_link: null,
      requested_at: new Date().toISOString(),
      decided_at: null,
    };

    const { data: saved, error: upsertError } = await supabaseAdmin
      .from("join_requests")
      .upsert(row, { onConflict: "stack_id,user_id" })
      .select("*")
      .single();

    if (upsertError || !saved) {
      console.error("Failed to save join request:", upsertError);
      return createErrorResponse("Failed to save join request", 500);
    }

    return NextResponse.json({ success: true, request: saved });
  } catch (err) {
    console.error("Create join request endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const circleId = req.nextUrl.searchParams.get("circleId");
    const privyUserId = req.nextUrl.searchParams.get("privyUserId");

    if (!circleId) return createErrorResponse("circleId is required");
    if (!privyUserId) return createErrorResponse("privyUserId is required");

    const user = await getUserByPrivyId(privyUserId);

    if (!user || !user.wallet_address) {
      return createErrorResponse(
        "No onboarded wallet found for this user",
        404
      );
    }

    const owner = await getCircleOwner(BigInt(circleId));

    if (!owner) return createErrorResponse("This stack does not exist", 404);

    const isOwner = owner.toLowerCase() === user.wallet_address.toLowerCase();

    if (isOwner) {
      const { data, error } = await supabaseAdmin
        .from("join_requests")
        .select("*")
        .eq("stack_id", circleId)
        .in("status", ["pending", "approved"])
        .order("requested_at", { ascending: true });

      if (error) {
        console.error("Failed to fetch join requests:", error);
        return createErrorResponse("Failed to fetch join requests", 500);
      }

      return NextResponse.json({ success: true, isOwner, requests: data });
    }

    const { data } = await supabaseAdmin
      .from("join_requests")
      .select("*")
      .eq("stack_id", circleId)
      .eq("user_id", user.id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      isOwner,
      requests: data ? [data] : [],
    });
  } catch (err) {
    console.error("Fetch join requests endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return createErrorResponse("Invalid request body");
    }

    const { circleId, requestId, privyUserId, action, inviteLink } = body as {
      circleId?: string;
      requestId?: string;
      privyUserId?: string;
      action?: "approve" | "reject";
      inviteLink?: JoinRequestInviteLink & { signature?: string };
    };

    if (!circleId || typeof circleId !== "string") {
      return createErrorResponse("circleId is required and must be a string");
    }
    if (!requestId || typeof requestId !== "string") {
      return createErrorResponse("requestId is required and must be a string");
    }
    if (!privyUserId || typeof privyUserId !== "string") {
      return createErrorResponse(
        "privyUserId is required and must be a string"
      );
    }
    if (action !== "approve" && action !== "reject") {
      return createErrorResponse('action must be "approve" or "reject"');
    }

    const user = await getUserByPrivyId(privyUserId);

    if (!user || !user.wallet_address) {
      return createErrorResponse(
        "No onboarded wallet found for this user",
        404
      );
    }

    const parsedId = BigInt(circleId);
    const owner = await getCircleOwner(parsedId);

    if (!owner) return createErrorResponse("This stack does not exist", 404);

    if (owner.toLowerCase() !== user.wallet_address.toLowerCase()) {
      return createErrorResponse(
        "Only the stack owner can review join requests",
        403
      );
    }

    const { data: request, error: fetchError } = await supabaseAdmin
      .from("join_requests")
      .select("*")
      .eq("id", requestId)
      .eq("stack_id", circleId)
      .single();

    if (fetchError || !request) {
      return createErrorResponse("Join request not found", 404);
    }

    if (request.status !== "pending") {
      return createErrorResponse("This request has already been decided");
    }

    if (action === "reject") {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("join_requests")
        .update({ status: "rejected", decided_at: new Date().toISOString() })
        .eq("id", requestId)
        .select("*")
        .single();

      if (updateError || !updated) {
        console.error("Failed to reject join request:", updateError);
        return createErrorResponse("Failed to reject join request", 500);
      }

      return NextResponse.json({ success: true, request: updated });
    }

    if (
      !inviteLink ||
      typeof inviteLink.nonce !== "string" ||
      typeof inviteLink.signature !== "string" ||
      typeof inviteLink.short !== "string" ||
      typeof inviteLink.long !== "string"
    ) {
      return createErrorResponse(
        "inviteLink { nonce, signature, short, long } is required to approve"
      );
    }

    const nonce = BigInt(inviteLink.nonce);
    const signer = await recoverInviteSigner({
      chainId: serverEnv.NEXT_PUBLIC_CHAIN_ID,
      circleId: parsedId,
      nonce,
      signature: inviteLink.signature as `0x${string}`,
    }).catch(() => null);

    if (!signer || signer.toLowerCase() !== owner.toLowerCase()) {
      return createErrorResponse("Invalid invite signature");
    }

    const publicClient = getServerPublicClient();
    const nonceUsed = await publicClient.readContract({
      address: SAVING_CIRCLES_CONTRACT_ADDRESS,
      abi: savingCirclesAbi,
      functionName: "usedNonces",
      args: [parsedId, nonce],
    });

    if (nonceUsed) {
      return createErrorResponse("This invite nonce has already been used");
    }

    const { data: stackMetadata, error: metadataError } = await supabaseAdmin
      .from("stacks_metadata")
      .select("expected_members, invite_links")
      .eq("id", circleId)
      .single();

    if (metadataError || !stackMetadata) {
      return createErrorResponse("Stack metadata not found", 404);
    }

    const existingLinks =
      (stackMetadata.invite_links as SupabaseInviteLink[]) ?? [];

    if (existingLinks.some((link) => link.long.includes(`nonce=${nonce}`))) {
      return createErrorResponse("This invite nonce is already in use");
    }

    const memberCount = await publicClient.readContract({
      address: SAVING_CIRCLES_CONTRACT_ADDRESS,
      abi: savingCirclesAbi,
      functionName: "getCircleMembers",
      args: [parsedId],
    });

    // Only count seats already promised through *this* review flow — not
    // stack-creation's pre-generated batch invites, which sit unused in
    // invite_links regardless of whether the owner ever hands them out and
    // would otherwise make committedSeats == expected_members immediately on
    // every stack, permanently blocking approvals.
    const { data: approvedRequests } = await supabaseAdmin
      .from("join_requests")
      .select("invite_link")
      .eq("stack_id", circleId)
      .eq("status", "approved");

    const approvedNonces = (approvedRequests ?? [])
      .map((r) => r.invite_link?.nonce)
      .filter((n): n is string => !!n)
      .map((n) => BigInt(n));

    const redeemedFlags = await Promise.all(
      approvedNonces.map((approvedNonce) =>
        publicClient.readContract({
          address: SAVING_CIRCLES_CONTRACT_ADDRESS,
          abi: savingCirclesAbi,
          functionName: "usedNonces",
          args: [parsedId, approvedNonce],
        })
      )
    );

    const openSeats = redeemedFlags.filter((used) => !used).length;
    const committedSeats = memberCount.length + openSeats;

    if (
      stackMetadata.expected_members > 0 &&
      committedSeats >= stackMetadata.expected_members
    ) {
      return createErrorResponse("This stack's member cap has been reached");
    }

    const newLink: SupabaseInviteLink = {
      short: inviteLink.short,
      long: inviteLink.long,
      used: false,
    };

    const { error: linksUpdateError } = await supabaseAdmin
      .from("stacks_metadata")
      .update({ invite_links: [...existingLinks, newLink] })
      .eq("id", circleId);

    if (linksUpdateError) {
      console.error("Failed to append invite link:", linksUpdateError);
      return createErrorResponse("Failed to save invite link", 500);
    }

    const approvedInviteLink: JoinRequestInviteLink = {
      short: inviteLink.short,
      long: inviteLink.long,
      nonce: inviteLink.nonce,
    };

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("join_requests")
      .update({
        status: "approved",
        invite_link: approvedInviteLink,
        decided_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .select("*")
      .single();

    if (updateError || !updated) {
      console.error("Failed to approve join request:", updateError);
      return createErrorResponse("Failed to approve join request", 500);
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (err) {
    console.error("Decide join request endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
