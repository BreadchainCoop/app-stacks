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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  return NextResponse.json({
    id: row.id,
    username: row.profiles?.username ?? null,
  });
}
