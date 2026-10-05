"use client";

import { DepositInterval } from "@/interfaces/deposit-interval";
import z from "zod";
import { jsonChainsSchema } from "./envs/chain-schema";

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

const envSchema = z
  .object({
    NEXT_PUBLIC_CHAIN_ID: z.coerce.number(),
    // Per-chain contract + deposit-token config, JSON keyed by chain id. This
    // replaced the single-chain NEXT_PUBLIC_SAVING_CIRCLES_* / DEPOSIT_TOKEN_*
    // vars so one build can serve several chains.
    NEXT_PUBLIC_CHAINS: jsonChainsSchema,
    NEXT_PUBLIC_CELO_FEE_CURRENCY: z.string().default(""),
    NEXT_PUBLIC_SEPOLIA_RPC_URL: z.string().optional().default(""),
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string(),
    // Deployment tier. Required with no default, so a deployment that omits it
    // fails to boot instead of silently defaulting. The chain is no longer part
    // of this value: one deployment serves every chain in NEXT_PUBLIC_CHAINS.
    NEXT_PUBLIC_NODE_ENV: z.enum(["local", "development", "prod"]),
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
  })
  .superRefine((env, ctx) => {
    if (!(String(env.NEXT_PUBLIC_CHAIN_ID) in env.NEXT_PUBLIC_CHAINS)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["NEXT_PUBLIC_CHAIN_ID"],
        message: `chain ${env.NEXT_PUBLIC_CHAIN_ID} has no NEXT_PUBLIC_CHAINS entry (configured: ${Object.keys(env.NEXT_PUBLIC_CHAINS).join(", ") || "none"})`,
      });
    }
  });

const parsedSchema = envSchema.safeParse({
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  NEXT_PUBLIC_CHAINS: process.env.NEXT_PUBLIC_CHAINS,
  NEXT_PUBLIC_CELO_FEE_CURRENCY: process.env.NEXT_PUBLIC_CELO_FEE_CURRENCY,
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

export const isLocalEnv = clientEnv.NEXT_PUBLIC_NODE_ENV === "local";
