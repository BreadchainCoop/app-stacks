import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { serverEnv } from "@/lib/envs/server";
import { validateAlias } from "@/lib/alias";
import { createErrorResponse } from "../utils";

const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

const privyJwks = createRemoteJWKSet(
  new URL(
    `https://auth.privy.io/api/v1/apps/${serverEnv.NEXT_PUBLIC_PRIVY_APP_ID}/jwks.json`
  )
);

const verifyPrivyToken = async (req: NextRequest): Promise<string | null> => {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  try {
    const { payload } = await jwtVerify(header.slice(7), privyJwks, {
      issuer: "privy.io",
      audience: serverEnv.NEXT_PUBLIC_PRIVY_APP_ID,
    });

    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
};

export async function POST(req: NextRequest) {
  try {
    const privyUserId = await verifyPrivyToken(req);
    if (!privyUserId) return createErrorResponse("Unauthorized", 401);

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return createErrorResponse("Invalid JSON in request body");
    }

    const alias = (body as { alias?: unknown })?.alias;

    if (typeof alias !== "string") {
      return createErrorResponse("alias is required and must be a string");
    }

    const trimmed = alias.trim();
    const validationError = validateAlias(trimmed);
    if (validationError) return createErrorResponse(validationError);

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("privy_user_id", privyUserId)
      .single();

    if (userError || !user) return createErrorResponse("User not found", 404);

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        { user_id: user.id, username: trimmed },
        { onConflict: "user_id" }
      );

    if (profileError) {
      if (profileError.code === "23505") {
        return createErrorResponse("That alias is already taken", 409);
      }

      console.error("Failed to save alias:", profileError);
      return createErrorResponse("Failed to save alias", 500);
    }

    return NextResponse.json({ username: trimmed });
  } catch (err) {
    console.error("Profile endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
