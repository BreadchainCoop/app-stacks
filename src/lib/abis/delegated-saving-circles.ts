export const delegatedSavingCirclesAbi = [
  {
    type: "function",
    name: "setDelegatedDepositsEnabled",
    stateMutability: "nonpayable",
    inputs: [{ name: "_enabled", type: "bool" }],
    outputs: [],
  },
  {
    type: "function",
    name: "isDelegatedDepositsEnabled",
    stateMutability: "view",
    inputs: [{ name: "_member", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "getAddressesForDeposit",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "circleIds", type: "uint256[]" },
      { name: "members", type: "address[]" },
    ],
  },
  {
    type: "function",
    name: "depositIfAllowed",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_circleId", type: "uint256" },
      { name: "_member", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "batchDepositIfAllowed",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_circleIds", type: "uint256[]" },
      { name: "_members", type: "address[]" },
    ],
    outputs: [],
  },
] as const;
