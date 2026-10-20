import { NextRequest, NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { serverEnv } from "@/lib/envs/server";
import {
  MINIPAY_SESSION,
  NIMIQ_PAY_SESSION,
  verifySessionToken,
} from "./session-token";

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

/**
 * Verifies the bearer token — a MiniPay or Nimiq Pay session token, or a
 * Privy access token — and returns the caller's external user id
 * (users.privy_user_id). MiniPay and Nimiq Pay have no Privy session, so their
 * stacks mint their own HMAC tokens (./session-token.ts).
 */
export const verifyUserToken = async (
  req: NextRequest
): Promise<string | null> => {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice(7);

  // Session tokens first: local HMAC checks, no network round-trip
  const miniPayUserId = await verifySessionToken(MINIPAY_SESSION, token);
  if (miniPayUserId) return miniPayUserId;

  const nimiqPayUserId = await verifySessionToken(NIMIQ_PAY_SESSION, token);
  if (nimiqPayUserId) return nimiqPayUserId;

  return verifyPrivyToken(req);
};
