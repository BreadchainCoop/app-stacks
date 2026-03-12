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

    const { id, stackname, expected_members, invite_links } =
      body as CreateStackRequestBody;

    if (!id || typeof id !== "string") {
      return createErrorResponse("id is required and must be a string");
    }

    if (!stackname || typeof stackname !== "string") {
      return createErrorResponse("stackname is required and must be a string");
    }

    const { error } = await supabaseAdmin
      .from("stacks_metadata")
      .insert({ id, stackname, expected_members, invite_links });

    if (error) {
      console.error("Failed to insert stack metadata:", error);
      return createErrorResponse("Failed to save stack metadata", 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Create stack endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
