import { Address } from "viem";

// TEMPORARY: hardcoded Sepolia addresses for Netlify preview testing of
// automatic claims. Revert this commit before merging — production reads
// from env vars (see src/lib/env.ts).

export const SAVING_CIRCLES_CONTRACT_ADDRESS =
  "0x2e100eafa295cc0796a5ddaae790847af6024ca7" as Address;

export const SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS =
  "0x1f612ae4af53b8320160532bd30d711953136831" as Address;

export const AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS =
  "0xdf4d83126c5d2162686871b17c037781d8e0ef04" as Address;

export const BREAD_TOKEN_ADDRESS =
  "0x30142762922fa1594eA0b9e2e9a3b167F5FF31B0" as Address;
