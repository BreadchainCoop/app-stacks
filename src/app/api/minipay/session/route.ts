import { serverEnv } from "@/lib/envs/server";
import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { createErrorResponse } from "../../utils";
import { minipayUserId } from "@/utils/minipay";
import { MINIPAY_SESSION, mintSessionToken } from "../../session-token";
import { OnboardError, onboardExternalUser } from "../../onboard-external-user";

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

    let isNewUser: boolean;

    try {
      ({ isNewUser } = await onboardExternalUser(externalUserId, address));
    } catch (err) {
      if (err instanceof OnboardError) {
        return createErrorResponse(err.message, 500);
      }
      throw err;
    }

    const token = await mintSessionToken(MINIPAY_SESSION, externalUserId);

    return NextResponse.json({ token, isNewUser });
  } catch (err) {
    console.error("MiniPay session endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
