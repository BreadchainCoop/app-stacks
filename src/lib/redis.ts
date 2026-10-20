import { Redis } from "@upstash/redis";
import { serverEnv } from "@/lib/envs/server";

// Server-only: the REST token is a secret. Shared by the short-link cache
// (src/app/api/shorten) and the Nimiq Pay sign-in nonces
// (src/app/api/nimiq-pay).
export const redis = new Redis({
  url: serverEnv.UPSTASH_REDIS_REST_URL,
  token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
});
