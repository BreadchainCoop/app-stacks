export const breadAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "payable",
    inputs: [{ name: "receiver", type: "address" }],
    outputs: [],
  },
] as const;
