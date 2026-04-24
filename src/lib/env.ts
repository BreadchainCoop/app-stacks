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

const envSchema = z.object({
  NEXT_PUBLIC_CHAIN_ID: z.coerce.number(),
  NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS: z.string(),
  NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS: z.string(),
  NEXT_PUBLIC_BREAD_TOKEN_ADDRESS: z.string(),
  NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK: z.string(),
  NEXT_PUBLIC_SEPOLIA_RPC_URL: z.string().optional().default(""),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string(),
  NEXT_PUBLIC_NODE_ENV: z
    .enum(["development", "production", "local"])
    .default("production"),
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
});

const parsedSchema = envSchema.safeParse({
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS:
    process.env.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
  NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS:
    process.env.NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
  NEXT_PUBLIC_BREAD_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS,
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
});

if (!parsedSchema.success) {
  const errMsg = "___ Provide all CLIENT env variables ___";

  console.log(errMsg);

  console.log(parsedSchema.error.issues);
  throw new Error(errMsg);
}

export const clientEnv = parsedSchema.data;
