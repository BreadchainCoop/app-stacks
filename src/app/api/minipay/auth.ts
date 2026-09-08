import { jwtVerify, SignJWT } from "jose";
import { serverEnv } from "@/lib/envs/server";

// MiniPay session tokens: MiniPay supports no message signing, so instead of
// SIWE the injected address is exchanged for a short-lived HMAC-signed JWT
// (issue #154 § 2, option 1). The MiniPay in-app browser is the trust
// boundary — this is deliberately weaker than proof of key possession.
const MINIPAY_JWT_ISSUER = "app-stacks";
const MINIPAY_JWT_AUDIENCE = "minipay-session";

const secretKey = (secret: string) => new TextEncoder().encode(secret);

export const mintMiniPaySessionToken = async (
  externalUserId: string
): Promise<string> => {
  if (!serverEnv.MINIPAY_SESSION_SECRET) {
    throw new Error("MINIPAY_SESSION_SECRET is not configured");
  }

  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(externalUserId)
    .setIssuer(MINIPAY_JWT_ISSUER)
    .setAudience(MINIPAY_JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey(serverEnv.MINIPAY_SESSION_SECRET));
};

/** Returns the external user id ("minipay:<address>") or null if invalid. */
export const verifyMiniPaySessionToken = async (
  token: string
): Promise<string | null> => {
  if (!serverEnv.MINIPAY_SESSION_SECRET) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      secretKey(serverEnv.MINIPAY_SESSION_SECRET),
      { issuer: MINIPAY_JWT_ISSUER, audience: MINIPAY_JWT_AUDIENCE }
    );

    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
};
