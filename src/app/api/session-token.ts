import { jwtVerify, SignJWT } from "jose";
import { serverEnv } from "@/lib/envs/server";

// Session tokens for the wallet hosts that have no Privy session: an address is
// exchanged for a short-lived HMAC-signed JWT whose subject is the external
// user id (users.privy_user_id). The hosts differ in what that exchange trusts:
//
// - MiniPay supports no message signing, so the injected address is taken as
//   given (issue #154 § 2, option 1). The MiniPay in-app browser is the trust
//   boundary — deliberately weaker than proof of key possession.
// - Nimiq Pay can sign, so its token is minted only after the wallet signs a
//   single-use nonce (src/app/api/nimiq-pay/session/route.ts).
//
// Each host has its own secret and audience, so one host's token never
// verifies as the other's.
const JWT_ISSUER = "app-stacks";

type SessionKind = {
  audience: string;
  secretName: string;
  secret: string | undefined;
};

export const MINIPAY_SESSION: SessionKind = {
  audience: "minipay-session",
  secretName: "MINIPAY_SESSION_SECRET",
  secret: serverEnv.MINIPAY_SESSION_SECRET,
};

export const NIMIQ_PAY_SESSION: SessionKind = {
  audience: "nimiqpay-session",
  secretName: "NIMIQ_PAY_SESSION_SECRET",
  secret: serverEnv.NIMIQ_PAY_SESSION_SECRET,
};

const secretKey = (secret: string) => new TextEncoder().encode(secret);

export const mintSessionToken = async (
  kind: SessionKind,
  externalUserId: string
): Promise<string> => {
  if (!kind.secret) {
    throw new Error(`${kind.secretName} is not configured`);
  }

  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(externalUserId)
    .setIssuer(JWT_ISSUER)
    .setAudience(kind.audience)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey(kind.secret));
};

/** Returns the external user id the token was minted for, or null if invalid. */
export const verifySessionToken = async (
  kind: SessionKind,
  token: string
): Promise<string | null> => {
  if (!kind.secret) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(kind.secret), {
      issuer: JWT_ISSUER,
      audience: kind.audience,
    });

    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
};
