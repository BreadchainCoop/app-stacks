import z from "zod";

const envSchema = z.object({
  SPOO_TOKEN: z.string(),
  UPSTASH_REDIS_REST_URL: z.string(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SEPOLIA_RPC_URL: z.string().optional(),
  AUTOMATIC_FUNDING_PRIVATE_KEY: z.string().optional(),
  NEXT_PUBLIC_SEPOLIA_BREAD_TOKEN_ADDRESS: z.string().optional(),
});

const parsedSchema = envSchema.safeParse(process.env);

if (!parsedSchema.success) {
  const errMsg = "___ Provide all SERVER env variables ___";

  console.log(errMsg);

  console.log(parsedSchema.error.issues);
  throw new Error(errMsg);
}

export const serverEnv = parsedSchema.data;
