import { serverEnv } from "@/lib/envs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "../../utils";

const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

interface SetAutomaticClaimsBody {
  privyUserId: string;
  stackId: string;
  enabled: boolean;
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as SetAutomaticClaimsBody;
    const { privyUserId, stackId, enabled } = body;

    if (!privyUserId || !stackId || typeof enabled !== "boolean") {
      return createErrorResponse(
        "privyUserId, stackId, and enabled are required"
      );
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("privy_user_id", privyUserId)
      .single();

    if (userError || !user) {
      return createErrorResponse("User not found", 404);
    }

    const { error } = await supabaseAdmin
      .from("user_stacks")
      .update({ automatic_claims: enabled })
      .eq("user_id", user.id)
      .eq("stack_id", stackId);

    if (error) {
      console.error("Failed to update automatic_claims:", error);
      return createErrorResponse("Failed to update", 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("automatic-claims endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
