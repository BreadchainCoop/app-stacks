// Nonces for Nimiq Pay sign-in live in Redis only between being issued
// (./nonce/route.ts) and being consumed (./session/route.ts), so a signature
// is useless after its first use or after this TTL.
export const SIGN_IN_NONCE_TTL_SECONDS = 5 * 60;

export const signInNonceKey = (nonce: string) =>
  `nimiq-pay:sign-in-nonce:${nonce}`;
