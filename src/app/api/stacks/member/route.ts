import { serverEnv } from "@/lib/envs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "../../utils";

const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

interface RemoveMemberRequestBody {
  circleId: string;
  walletAddress: string;
}

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

    if (!walletAddress || typeof walletAddress !== "string") {
      return createErrorResponse(
        "walletAddress is required and must be a string"
      );
    }

    const { data: user, error: userFetchError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("wallet_address", walletAddress)
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
