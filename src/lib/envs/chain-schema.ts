import z from "zod";
import { CHAIN_SLUGS } from "@/lib/chain-slugs";

const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "must be a 0x-prefixed address");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const chainConfigSchema = z.object({
  savingCircles: addressSchema,
  savingCirclesViewer: addressSchema,
  automaticSavingCircles: addressSchema,
  // Optional per chain: a chain without Goal savings deployed omits it and gets
  // the zero address, which the feature gates already treat as absent.
  goalSavings: addressSchema.optional().default(ZERO_ADDRESS),
  // JSON has no bigint, so accept a decimal string (or number) and convert
  // once here — every consumer wants a bigint block number.
  contractCreationBlock: z
    .union([z.string().regex(/^\d+$/), z.number().int().nonnegative()])
    .transform((v) => BigInt(v)),
  depositToken: z.object({
    address: addressSchema,
    symbol: z.string().min(1),
    decimals: z.number().int().nonnegative(),
  }),
});

// Keyed by chain id. Every chain a deployment can serve must have an entry.
// Shared by clientEnv (src/lib/env.ts) and serverEnv (./server.ts) so the two
// can never disagree about what a chain's config looks like.
export const chainsSchema = z
  .record(
    z.string().regex(/^\d+$/, "chain ids must be decimal strings"),
    chainConfigSchema
  )
  .refine(
    (chains) => Object.keys(chains).length > 0,
    "at least one chain must be configured"
  )
  // Every configured chain needs a URL slug, because the chain is a route
  // segment. Without this the deployment boots and then 404s that chain's
  // pages, which is a slow way to discover a one-line omission.
  .superRefine((chains, ctx) => {
    const missing = Object.keys(chains).filter(
      (id) => CHAIN_SLUGS[Number(id)] === undefined
    );

    if (missing.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `chain(s) ${missing.join(", ")} have no slug in CHAIN_SLUGS (src/lib/chain-slugs.ts); add one per chain before configuring it`,
      });
    }
  });

// NEXT_PUBLIC_CHAINS is a JSON blob; parse it before handing it to the schema.
export const jsonChainsSchema = z
  .string()
  .transform((val, ctx) => {
    try {
      return JSON.parse(val) as Record<string, unknown>;
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "NEXT_PUBLIC_CHAINS must be valid JSON",
      });
      return z.NEVER;
    }
  })
  .pipe(chainsSchema);
