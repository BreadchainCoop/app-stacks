import { NextResponse } from "next/server";
import { toHex } from "viem";
import { redis } from "@/lib/redis";
import { createErrorResponse } from "../../utils";
import { SIGN_IN_NONCE_TTL_SECONDS, signInNonceKey } from "../sign-in-nonce";

// Issues a single-use nonce for a Nimiq Pay wallet to sign
// (src/lib/nimiq-pay-sign-in.ts). POST so nothing caches it.
export async function POST() {
  try {
    const nonce = toHex(crypto.getRandomValues(new Uint8Array(16)));

    await redis.set(signInNonceKey(nonce), 1, {
      ex: SIGN_IN_NONCE_TTL_SECONDS,
    });

    return NextResponse.json({ nonce });
  } catch (err) {
    console.error("Nimiq Pay nonce endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
