"use client";

import { DepositInterval } from "@/interfaces/deposit-interval";
import z from "zod";

const HARDCODED_DEPOSIT_INTERVALS = `[
  {"id":"5mins","label":"5 minutes","seconds":300},
  {"id":"10mins","label":"10 minutes","seconds":600},
  {"id":"30mins","label":"30 minutes","seconds":1800},
  {"id":"1day","label":"1 day","seconds":86400,"unit":"day"},
  {"id":"3days","label":"3 days","seconds":259200},
  {"id":"1week","label":"weekly","seconds":604800,"description":"7 days"},
  {"id":"2weeks","label":"2 weeks","seconds":1209600,"description":"14 days"},
  {"id":"3weeks","label":"3 weeks","seconds":1814400,"description":"21 days"},
  {"id":"1month","label":"monthly","seconds":2592000,"description":"30 days"}
]`;

const HARDCODED_SEPOLIA_ENV = {
  NEXT_PUBLIC_CHAIN_ID: 11155111,
  NEXT_PUBLIC_NODE_ENV: "sepolia",
  NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS:
    "0x9abd0b6b197eb3885cdc8987fa5ef5ba319858e2",
  NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS:
    "0x09cf35451cbb60ffa70a80be5f04d49213286262",
  NEXT_PUBLIC_BREAD_TOKEN_ADDRESS: "0x30142762922fa1594eA0b9e2e9a3b167F5FF31B0",
  NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK: "10736917",
} as const;

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
    .enum(["development", "production", "local", "sepolia"])
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
  NEXT_PUBLIC_CHAIN_ID: HARDCODED_SEPOLIA_ENV.NEXT_PUBLIC_CHAIN_ID,
  NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS:
    HARDCODED_SEPOLIA_ENV.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
  NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS:
    HARDCODED_SEPOLIA_ENV.NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
  NEXT_PUBLIC_BREAD_TOKEN_ADDRESS:
    HARDCODED_SEPOLIA_ENV.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS,
  NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK:
    HARDCODED_SEPOLIA_ENV.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK,
  NEXT_PUBLIC_SEPOLIA_RPC_URL: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  NEXT_PUBLIC_NODE_ENV: HARDCODED_SEPOLIA_ENV.NEXT_PUBLIC_NODE_ENV,
  NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  NEXT_PUBLIC_PRIVY_CLIENT_ID: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID,
  NEXT_PUBLIC_ALCHEMY_API_KEY_ETHEREUM_MAINNET:
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_ETHEREUM_MAINNET,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_DEPOSIT_INTERVALS: HARDCODED_DEPOSIT_INTERVALS,
});

if (!parsedSchema.success) {
  const errMsg = "___ Provide all CLIENT env variables ___";

  console.log(errMsg);

  console.log(parsedSchema.error.issues);
  throw new Error(errMsg);
}

export const clientEnv = parsedSchema.data;
