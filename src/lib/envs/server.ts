import z from "zod";

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_BREAD_TOKEN_ADDRESS =
  "0x30142762922fa1594eA0b9e2e9a3b167F5FF31B0";

const envSchema = z.object({
  SPOO_TOKEN: z.string(),
  UPSTASH_REDIS_REST_URL: z.string(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SEPOLIA_RPC_URL: z.string().optional(),
  AUTOMATIC_FUNDING_PRIVATE_KEY: z.string(),
  NEXT_PUBLIC_CHAIN_ID: z.coerce.number(),
  NEXT_PUBLIC_BREAD_TOKEN_ADDRESS: z.string(),
});

const parsedSchema = envSchema.safeParse({
  ...process.env,
  NEXT_PUBLIC_CHAIN_ID: SEPOLIA_CHAIN_ID,
  NEXT_PUBLIC_BREAD_TOKEN_ADDRESS: SEPOLIA_BREAD_TOKEN_ADDRESS,
});

if (!parsedSchema.success) {
  const errMsg = "___ Provide all SERVER env variables ___";

  console.log(errMsg);

  console.log(parsedSchema.error.issues);
  throw new Error(errMsg);
}

export const serverEnv = parsedSchema.data;
