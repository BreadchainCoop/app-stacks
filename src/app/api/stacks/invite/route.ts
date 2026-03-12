import { serverEnv } from "@/lib/envs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "../../utils";
import { SupabaseInviteLink } from "@/lib/supabase";

const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

interface RedeemInviteRequestBody {
  circleId: string;
  nonce: string;
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

    const { circleId, nonce } = body as RedeemInviteRequestBody;

    if (!circleId || typeof circleId !== "string") {
      return createErrorResponse("circleId is required and must be a string");
    }

    if (!nonce || typeof nonce !== "string") {
      return createErrorResponse("nonce is required and must be a string");
    }

    const { data, error: fetchError } = await supabaseAdmin
      .from("stacks_metadata")
      .select("invite_links")
      .eq("id", circleId)
      .single();

    if (fetchError || !data) {
      console.error("Failed to fetch stack metadata:", fetchError);
      return createErrorResponse("Stack not found", 404);
    }

    const updatedLinks = (data.invite_links as SupabaseInviteLink[]).map(
      (link) =>
        link.long.includes(`nonce=${nonce}`) ? { ...link, used: true } : link
    );

    const { error: updateError } = await supabaseAdmin
      .from("stacks_metadata")
      .update({ invite_links: updatedLinks })
      .eq("id", circleId);

    if (updateError) {
      console.error("Failed to update invite link:", updateError);
      return createErrorResponse("Failed to update invite link", 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Redeem invite endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
