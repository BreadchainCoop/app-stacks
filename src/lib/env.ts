"use client";

import { DepositInterval } from "@/interfaces/deposit-interval";
import z from "zod";

const depositIntervalSchema = z
  .array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      seconds: z.number().positive(),
      description: z.string().optional(),
    })
  )
  .min(2, "At least two deposit intervals are required");

const featuresSchema = z.record(
  z.string(),
  z.object({
    enabled: z.boolean(),
    addresses: z.array(z.string().regex(/^0x[a-fA-F0-9]{40}$/)).optional(),
  })
);

const envSchema = z.object({
  NEXT_PUBLIC_CHAIN_ID: z.coerce.number(),
  NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS: z.string(),
  NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS: z.string(),
  NEXT_PUBLIC_AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS: z.string(),
  NEXT_PUBLIC_BREAD_TOKEN_ADDRESS: z.string(),
  // Empty string (e.g. a blank line copied from .env.local.example) must
  // fall back to the default, not coerce to ""/0
  NEXT_PUBLIC_DEPOSIT_TOKEN_SYMBOL: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().default("BREAD")
  ),
  NEXT_PUBLIC_DEPOSIT_TOKEN_DECIMALS: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.coerce.number().int().default(18)
  ),
  NEXT_PUBLIC_CELO_FEE_CURRENCY: z.string().default(""),
  NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK: z.string(),
  NEXT_PUBLIC_SEPOLIA_RPC_URL: z.string().optional().default(""),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string(),
  // Tier and chain in one value, e.g. "prod-celo" — required, no default, so a
  // deployment that omits it fails to boot instead of silently defaulting.
  NEXT_PUBLIC_NODE_ENV: z.enum([
    "local",
    "local-celo",
    "development",
    "development-celo",
    "prod",
    "prod-celo",
  ]),
  NEXT_PUBLIC_PRIVY_APP_ID: z.string(),
  NEXT_PUBLIC_PRIVY_CLIENT_ID: z.string(),
  NEXT_PUBLIC_ALCHEMY_API_KEY_ETHEREUM_MAINNET: z.string(),
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_DEPOSIT_INTERVALS: z
    .string()
    .transform((val, ctx) => {
      try {
        return JSON.parse(val) as DepositInterval[];
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "NEXT_PUBLIC_DEPOSIT_INTERVALS must be valid JSON",
        });
        return z.NEVER;
      }
    })
    .pipe(depositIntervalSchema),
  NEXT_PUBLIC_FEATURES: z
    .string()
    .optional()
    .default("{}")
    .transform((val, ctx) => {
      try {
        return JSON.parse(val) as Record<string, unknown>;
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "NEXT_PUBLIC_FEATURES must be valid JSON",
        });
        return z.NEVER;
      }
    })
    .pipe(featuresSchema),
});

const parsedSchema = envSchema.safeParse({
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS:
    process.env.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
  NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS:
    process.env.NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
  NEXT_PUBLIC_AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS:
    process.env.NEXT_PUBLIC_AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
  NEXT_PUBLIC_BREAD_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS,
  NEXT_PUBLIC_DEPOSIT_TOKEN_SYMBOL:
    process.env.NEXT_PUBLIC_DEPOSIT_TOKEN_SYMBOL,
  NEXT_PUBLIC_DEPOSIT_TOKEN_DECIMALS:
    process.env.NEXT_PUBLIC_DEPOSIT_TOKEN_DECIMALS,
  NEXT_PUBLIC_CELO_FEE_CURRENCY: process.env.NEXT_PUBLIC_CELO_FEE_CURRENCY,
  NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK:
    process.env.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK,
  NEXT_PUBLIC_SEPOLIA_RPC_URL: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  NEXT_PUBLIC_PRIVY_CLIENT_ID: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID,
  NEXT_PUBLIC_ALCHEMY_API_KEY_ETHEREUM_MAINNET:
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_ETHEREUM_MAINNET,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_DEPOSIT_INTERVALS: process.env.NEXT_PUBLIC_DEPOSIT_INTERVALS,
  NEXT_PUBLIC_FEATURES: process.env.NEXT_PUBLIC_FEATURES,
});

if (!parsedSchema.success) {
  const errMsg = "___ Provide all CLIENT env variables ___";

  console.log(errMsg);

  console.log(parsedSchema.error.issues);
  throw new Error(errMsg);
}

export const clientEnv = parsedSchema.data;

// "local" and "local-celo" are both local-tier — match either rather than
// repeating this everywhere NEXT_PUBLIC_NODE_ENV is checked for that.
export const isLocalEnv = clientEnv.NEXT_PUBLIC_NODE_ENV.startsWith("local");
