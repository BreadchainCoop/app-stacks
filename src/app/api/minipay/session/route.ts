import { serverEnv } from "@/lib/envs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getAddress, isAddress } from "viem";
import { createErrorResponse } from "../../utils";
import { minipayUserId } from "@/utils/minipay";
import { mintMiniPaySessionToken } from "../auth";

const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

// Onboards a MiniPay user from their injected wallet address and mints a
// session token, mirroring /api/onboard + the Privy access token. There is
// no signature to verify — MiniPay has no message signing, so the in-app
// browser is the trust boundary (issue #154 § 2, option 1).
export async function POST(req: NextRequest) {
  try {
    if (!serverEnv.MINIPAY_SESSION_SECRET) {
      return createErrorResponse("MiniPay sessions are not configured", 503);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return createErrorResponse("Invalid JSON in request body");
    }

    const address = (body as { address?: unknown })?.address;

    if (typeof address !== "string" || !isAddress(address)) {
      return createErrorResponse(
        "address is required and must be a valid address"
      );
    }

    const externalUserId = minipayUserId(address);

    const { data: existingUser, error: lookupError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("privy_user_id", externalUserId)
      .maybeSingle();

    if (lookupError) {
      console.error("Failed to look up user:", lookupError);
      return createErrorResponse("Failed to look up user", 500);
    }

    const isNewUser = !existingUser;
    let userId = existingUser?.id;

    if (!userId) {
      const { error: userError } = await supabaseAdmin.from("users").upsert(
        {
          id: crypto.randomUUID(),
          privy_user_id: externalUserId,
          wallet_address: getAddress(address),
        },
        { onConflict: "privy_user_id", ignoreDuplicates: true }
      );

      if (userError) {
        console.error("Failed to upsert user:", userError);
        return createErrorResponse("Failed to create user", 500);
      }

      // Fetch the actual id — differs if a concurrent request won the upsert
      const { data: user, error: fetchError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("privy_user_id", externalUserId)
        .single();

      if (fetchError || !user) {
        console.error("Failed to fetch user:", fetchError);
        return createErrorResponse("Failed to fetch user", 500);
      }

      userId = user.id;
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        { user_id: userId },
        { onConflict: "user_id", ignoreDuplicates: true }
      );

    if (profileError) {
      console.error("Failed to upsert profile:", profileError);
      return createErrorResponse("Failed to create profile", 500);
    }

    const token = await mintMiniPaySessionToken(externalUserId);

    return NextResponse.json({ token, isNewUser });
  } catch (err) {
    console.error("MiniPay session endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
