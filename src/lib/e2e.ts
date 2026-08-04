import { clientEnv } from "@/lib/env";

/**
 * Local end-to-end test wallet mode — the single source of truth.
 *
 * When on, the app drops Privy as the *signing* path and drives wagmi with an
 * injected EIP-1193 wallet instead, so an automated browser can complete a real
 * on-chain journey (Privy's CAPTCHA and domain allowlist make headless login
 * impossible from localhost).
 *
 * It is deliberately triple-gated so it cannot be turned on by accident in a
 * deployed environment:
 *   1. `NEXT_PUBLIC_NODE_ENV === "local"`  — never true on a deployed build
 *   2. `NEXT_PUBLIC_E2E_WALLET === "true"` — explicit opt-in
 *   3. `NEXT_PUBLIC_CHAIN_ID === 31337`    — anvil only, never a real network
 *
 * The app never holds a private key: it only talks to whatever EIP-1193
 * provider the test harness injects into the page.
 */
export const IS_E2E_WALLET =
  clientEnv.NEXT_PUBLIC_NODE_ENV === "local" &&
  clientEnv.NEXT_PUBLIC_E2E_WALLET === "true" &&
  clientEnv.NEXT_PUBLIC_CHAIN_ID === 31337;
