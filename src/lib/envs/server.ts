import z from "zod";
import { jsonChainsSchema } from "./chain-schema";

const envSchema = z.object({
  SPOO_TOKEN: z.string(),
  UPSTASH_REDIS_REST_URL: z.string(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SEPOLIA_RPC_URL: z.string().optional(),
  AUTOMATIC_FUNDING_PRIVATE_KEY: z.string(),
  // HMAC secret for MiniPay session JWTs; only required when serving MiniPay
  MINIPAY_SESSION_SECRET: z.string().optional(),
  // Privy app secret, for the server-side user lookup that resolves which
  // wallets a Privy account owns. Never NEXT_PUBLIC_ — that would inline it
  // into the client bundle.
  PRIVY_APP_SECRET: z.string().optional(),
  // Same per-chain config the client reads. Route handlers can't use hooks, so
  // they take the chain from the request and look it up here — see
  // ./server-chains.ts.
  NEXT_PUBLIC_CHAINS: jsonChainsSchema,
  // Still needed as the fallback chain for requests that don't name one.
  NEXT_PUBLIC_CHAIN_ID: z.coerce.number(),
  NEXT_PUBLIC_PRIVY_APP_ID: z.string(),
});

const parsedSchema = envSchema.safeParse(process.env);

if (!parsedSchema.success) {
  const errMsg = "___ Provide all SERVER env variables ___";

  console.log(errMsg);

  console.log(parsedSchema.error.issues);
  throw new Error(errMsg);
}

export const serverEnv = parsedSchema.data;
