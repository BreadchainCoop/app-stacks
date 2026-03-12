import { serverEnv } from "@/lib/envs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "../utils";

const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

interface OnboardRequestBody {
  privyUserId: string;
  walletAddress: string | null;
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

    const { privyUserId, walletAddress } = body as OnboardRequestBody;

    if (!privyUserId || typeof privyUserId !== "string") {
      return createErrorResponse(
        "privyUserId is required and must be a string"
      );
    }

    const userId = crypto.randomUUID();

    const { error: userError } = await supabaseAdmin.from("users").upsert(
      {
        id: userId,
        privy_user_id: privyUserId,
        wallet_address: walletAddress ?? null,
      },
      { onConflict: "privy_user_id" }
    );

    if (userError) {
      console.error("Failed to upsert user:", userError);
      return createErrorResponse("Failed to create user", 500);
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({ user_id: userId }, { onConflict: "user_id" });

    if (profileError) {
      console.error("Failed to upsert profile:", profileError);
      return createErrorResponse("Failed to create profile", 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Onboard endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
