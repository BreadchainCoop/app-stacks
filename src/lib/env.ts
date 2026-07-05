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
  NEXT_PUBLIC_AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS: z.string(),
  NEXT_PUBLIC_BREAD_TOKEN_ADDRESS: z.string(),
  NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK: z.string(),
  NEXT_PUBLIC_SEPOLIA_RPC_URL: z.string().optional().default(""),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string(),
  NEXT_PUBLIC_NODE_ENV: z
    .enum(["development", "demo", "production", "local"])
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
  // Local (Anvil) mode — all optional; defaults match the deterministic
  // deployer in the makefile (LOCAL_DEPLOYER_ADDRESS, nonces 0..5).
  NEXT_PUBLIC_LOCAL_SAVING_CIRCLES_ADDRESS: z
    .string()
    .default("0x7E2F05576D57cfa6617172ab3Df276fDfa02fA3e"),
  NEXT_PUBLIC_LOCAL_SAVING_CIRCLES_VIEWER_ADDRESS: z
    .string()
    .default("0xea06eDD211228a9eB7Af1Da186081ec00Ca7c009"),
  NEXT_PUBLIC_LOCAL_AUTOMATIC_SAVING_CIRCLES_ADDRESS: z
    .string()
    .default("0x565f8CD37c6085831b15A36D51c6b15d48a8FEde"),
  NEXT_PUBLIC_LOCAL_BREAD_TOKEN_ADDRESS: z
    .string()
    .default("0x347eA3E53Bd44bDD16Fe7CeF396a19806E12B686"),
  NEXT_PUBLIC_LOCAL_RPC_URL: z.string().default("http://localhost:8545"),
  NEXT_PUBLIC_LOCAL_SUPABASE_URL: z.string().default("http://127.0.0.1:54321"),
  // Standard supabase CLI demo anon key (constant across local installs).
  NEXT_PUBLIC_LOCAL_SUPABASE_ANON_KEY: z
    .string()
    .default(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    ),
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
  NEXT_PUBLIC_LOCAL_SAVING_CIRCLES_ADDRESS:
    process.env.NEXT_PUBLIC_LOCAL_SAVING_CIRCLES_ADDRESS,
  NEXT_PUBLIC_LOCAL_SAVING_CIRCLES_VIEWER_ADDRESS:
    process.env.NEXT_PUBLIC_LOCAL_SAVING_CIRCLES_VIEWER_ADDRESS,
  NEXT_PUBLIC_LOCAL_AUTOMATIC_SAVING_CIRCLES_ADDRESS:
    process.env.NEXT_PUBLIC_LOCAL_AUTOMATIC_SAVING_CIRCLES_ADDRESS,
  NEXT_PUBLIC_LOCAL_BREAD_TOKEN_ADDRESS:
    process.env.NEXT_PUBLIC_LOCAL_BREAD_TOKEN_ADDRESS,
  NEXT_PUBLIC_LOCAL_RPC_URL: process.env.NEXT_PUBLIC_LOCAL_RPC_URL,
  NEXT_PUBLIC_LOCAL_SUPABASE_URL: process.env.NEXT_PUBLIC_LOCAL_SUPABASE_URL,
  NEXT_PUBLIC_LOCAL_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_LOCAL_SUPABASE_ANON_KEY,
});

if (!parsedSchema.success) {
  const errMsg = "___ Provide all CLIENT env variables ___";

  console.log(errMsg);

  console.log(parsedSchema.error.issues);
  throw new Error(errMsg);
}

export const clientEnv = parsedSchema.data;
