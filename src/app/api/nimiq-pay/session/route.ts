import { serverEnv } from "@/lib/envs/server";
import { NextRequest, NextResponse } from "next/server";
import { isAddress, isHex, verifyTypedData } from "viem";
import { redis } from "@/lib/redis";
import { nimiqPaySignInTypedData } from "@/lib/nimiq-pay-sign-in";
import { nimiqPayUserId } from "@/utils/nimiq-pay";
import { createErrorResponse } from "../../utils";
import { NIMIQ_PAY_SESSION, mintSessionToken } from "../../session-token";
import { OnboardError, onboardExternalUser } from "../../onboard-external-user";
import { signInNonceKey } from "../sign-in-nonce";

// Signs in a Nimiq Pay user: checks that the wallet signed a nonce this
// server issued (./nonce), then onboards the user and mints a session token.
// Unlike MiniPay's session, which trusts the address it is given, this one
// requires proof of key possession — Nimiq Pay can sign, so it must.
export async function POST(req: NextRequest) {
  try {
    if (!serverEnv.NIMIQ_PAY_SESSION_SECRET) {
      return createErrorResponse("Nimiq Pay sessions are not configured", 503);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return createErrorResponse("Invalid JSON in request body");
    }

    const { address, nonce, signature } = (body ?? {}) as {
      address?: unknown;
      nonce?: unknown;
      signature?: unknown;
    };

    if (typeof address !== "string" || !isAddress(address)) {
      return createErrorResponse(
        "address is required and must be a valid address"
      );
    }

    if (typeof nonce !== "string" || !isHex(nonce)) {
      return createErrorResponse("nonce is required and must be a hex string");
    }

    if (typeof signature !== "string" || !isHex(signature)) {
      return createErrorResponse(
        "signature is required and must be a hex string"
      );
    }

    // Consume the nonce before checking the signature, so each nonce gets
    // exactly one attempt whether or not it succeeds.
    const issued = await redis.getdel(signInNonceKey(nonce));

    if (issued === null) {
      return createErrorResponse("Sign-in expired. Please try again.", 401);
    }

    // A signature that recovers no key at all throws rather than returning
    // false; it is just as invalid.
    const valid = await verifyTypedData({
      address,
      signature,
      ...nimiqPaySignInTypedData(address, nonce),
    }).catch(() => false);

    if (!valid) {
      return createErrorResponse("Invalid signature", 401);
    }

    const externalUserId = nimiqPayUserId(address);

    let isNewUser: boolean;

    try {
      ({ isNewUser } = await onboardExternalUser(externalUserId, address));
    } catch (err) {
      if (err instanceof OnboardError) {
        return createErrorResponse(err.message, 500);
      }
      throw err;
    }

    const token = await mintSessionToken(NIMIQ_PAY_SESSION, externalUserId);

    return NextResponse.json({ token, isNewUser });
  } catch (err) {
    console.error("Nimiq Pay session endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
