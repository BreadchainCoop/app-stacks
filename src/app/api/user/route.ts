import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "../utils";
import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/envs/server";

const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req: NextRequest) {
  const privyUserId = req.nextUrl.searchParams.get("privyUserId");

  if (!privyUserId) return createErrorResponse("privyUserId is required");

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("privy_user_id", privyUserId)
    .single();

  if (error || !data) return createErrorResponse("User not found", 404);

  return NextResponse.json({ id: data.id });
}
