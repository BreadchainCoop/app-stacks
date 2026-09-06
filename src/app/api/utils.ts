import { NextRequest, NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { serverEnv } from "@/lib/envs/server";

export function createErrorResponse(error: string, status: number = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

const privyJwks = createRemoteJWKSet(
  new URL(
    `https://auth.privy.io/api/v1/apps/${serverEnv.NEXT_PUBLIC_PRIVY_APP_ID}/jwks.json`
  )
);

/** Verifies the Privy access token and returns the caller's Privy user id. */
export const verifyPrivyToken = async (
  req: NextRequest
): Promise<string | null> => {
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
