import z from "zod";

const envSchema = z.object({
  SPOO_TOKEN: z.string(),
  UPSTASH_REDIS_REST_URL: z.string(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
});

const parsedSchema = envSchema.safeParse(process.env);

if (!parsedSchema.success) {
  const errMsg = "___ Provide all SERVER env variables ___";

  console.log(errMsg);

  console.log(parsedSchema.error.issues);
  throw new Error(errMsg);
}

export const serverEnv = parsedSchema.data;
