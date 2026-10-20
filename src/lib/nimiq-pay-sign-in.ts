import type { Address } from "viem";

/**
 * What a Nimiq Pay wallet signs to prove it owns an address. Built in one place
 * so the client that asks for the signature (providers/nimiq-pay.tsx) and the
 * server that checks it (api/nimiq-pay/session) sign over identical data.
 *
 * EIP-712 rather than personal_sign, as Nimiq's mini app checklist asks of
 * login challenges: the wallet shows the fields instead of an opaque string.
 * No chainId in the domain — the wallet may be on any chain when it signs in,
 * and owning a key is the same on every chain. The server-issued, single-use
 * nonce is what stops a signature being replayed.
 */
export const nimiqPaySignInTypedData = (address: Address, nonce: string) => ({
  domain: { name: "Stacks", version: "1" },
  types: {
    SignIn: [
      { name: "statement", type: "string" },
      { name: "address", type: "address" },
      { name: "nonce", type: "string" },
    ],
  } as const,
  primaryType: "SignIn" as const,
  message: { statement: "Sign in to Stacks", address, nonce },
});
