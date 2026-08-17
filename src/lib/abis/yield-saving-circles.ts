// ABI fragment for the yield-bearing saving circles variant (YieldSavingCircles).
// Only the NEW functions the yield UI needs are declared here; shared ROSCA
// functions (deposit/withdraw/getCircle/...) come from `savingCirclesAbi`.
//
// DRAFT: the YieldSavingCircles contract (BreadchainCoop/saving-circles#189,
// PR #190) is not deployed yet. Wire NEXT_PUBLIC_YIELD_SAVING_CIRCLES_CONTRACT_ADDRESS
// once it is, and regenerate this from the compiled artifact.
export const yieldSavingCirclesAbi = [
  {
    type: "function",
    name: "claim",
    inputs: [
      { name: "_id", type: "uint256", internalType: "uint256" },
      { name: "_keepStaked", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimYield",
    inputs: [{ name: "_receiver", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawStakedPrincipal",
    inputs: [{ name: "_receiver", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setClaimTiming",
    inputs: [
      { name: "_id", type: "uint256", internalType: "uint256" },
      { name: "_timing", type: "uint8", internalType: "enum YieldSavingCircles.ClaimTiming" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimableYield",
    inputs: [{ name: "member", type: "address", internalType: "address" }],
    outputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "claimTiming",
    inputs: [{ name: "id", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "timing", type: "uint8", internalType: "enum YieldSavingCircles.ClaimTiming" }],
    stateMutability: "view",
  },
] as const;

// Mirrors the on-chain enum `YieldSavingCircles.ClaimTiming`.
export enum ClaimTiming {
  Anytime = 0,
  EndOnly = 1,
}
