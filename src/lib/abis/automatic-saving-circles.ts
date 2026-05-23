export const automaticSavingCirclesAbi = [
  {
    type: "function",
    name: "setAutomaticDepositsEnabled",
    stateMutability: "nonpayable",
    inputs: [{ name: "_enabled", type: "bool" }],
    outputs: [],
  },
  {
    type: "function",
    name: "isAutomaticDepositsEnabled",
    stateMutability: "view",
    inputs: [{ name: "_member", type: "address" }],
    outputs: [{ type: "bool" }],
  },
] as const;
