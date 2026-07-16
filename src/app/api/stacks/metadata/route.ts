import { serverEnv } from "@/lib/envs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "../../utils";
import { SupabaseInviteLink } from "@/lib/supabase";

const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

interface CreateStackRequestBody {
  id: string;
  stackname: string;
  expected_members: number;
  invite_links: SupabaseInviteLink[];
  privyUserId: string;
}

export async function POST(req: NextRequest) {
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

    const { id, stackname, expected_members, invite_links, privyUserId } =
      body as CreateStackRequestBody;

    if (!id || typeof id !== "string") {
      return createErrorResponse("id is required and must be a string");
    }

    if (!stackname || typeof stackname !== "string") {
      return createErrorResponse("stackname is required and must be a string");
    }

    if (typeof expected_members !== "number" || expected_members < 1) {
      return createErrorResponse(
        "expected_members is required and must be a positive number"
      );
    }

    // Empty is allowed: MiniPay circles add members directly on-chain
    // (addMembers) and have no invite links
    if (!Array.isArray(invite_links)) {
      return createErrorResponse(
        "invite_links is required and must be an array"
      );
    }

    if (!privyUserId || typeof privyUserId !== "string") {
      return createErrorResponse(
        "privyUserId is required and must be a string"
      );
    }

    const { error: stackError } = await supabaseAdmin
      .from("stacks_metadata")
      .insert({ id, stackname, expected_members, invite_links });

    if (stackError) {
      console.error("Failed to insert stack metadata:", stackError);
      return createErrorResponse("Failed to save stack metadata", 500);
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

    const { error: userStackError } = await supabaseAdmin
      .from("user_stacks")
      .insert({ user_id: user.id, stack_id: id });

    if (userStackError) {
      console.error("Failed to insert user_stacks:", userStackError);
      return createErrorResponse("Failed to save user stack", 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Create stack endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
