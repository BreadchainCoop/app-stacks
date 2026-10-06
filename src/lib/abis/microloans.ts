export const microloansAbi = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "accept",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_termsHash",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancel",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "collect",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "create",
    inputs: [
      {
        name: "_loanTerms",
        type: "tuple",
        internalType: "struct IMicroloans.LoanTerms",
        components: [
          {
            name: "token",
            type: "address",
            internalType: "address",
          },
          {
            name: "vault",
            type: "address",
            internalType: "address",
          },
          {
            name: "principal",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "grant",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "acceptBy",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "repaymentPeriod",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "termsHash",
            type: "bytes32",
            internalType: "bytes32",
          },
        ],
      },
      {
        name: "_borrower",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "escrowValue",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "extendRepayBy",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_newRepayBy",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getBorrowerLoans",
    inputs: [
      {
        name: "_borrower",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "_ids",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLenderLoans",
    inputs: [
      {
        name: "_lender",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "_ids",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLoan",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "_loanTerms",
        type: "tuple",
        internalType: "struct IMicroloans.LoanTerms",
        components: [
          {
            name: "token",
            type: "address",
            internalType: "address",
          },
          {
            name: "vault",
            type: "address",
            internalType: "address",
          },
          {
            name: "principal",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "grant",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "acceptBy",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "repaymentPeriod",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "termsHash",
            type: "bytes32",
            internalType: "bytes32",
          },
        ],
      },
      {
        name: "_loanStatus",
        type: "tuple",
        internalType: "struct IMicroloans.LoanStatus",
        components: [
          {
            name: "lender",
            type: "address",
            internalType: "address",
          },
          {
            name: "borrower",
            type: "address",
            internalType: "address",
          },
          {
            name: "acceptedAt",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "repayBy",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "disbursed",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "repaid",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "held",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "lenderOwed",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "cancelled",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "grantPaid",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "grantReclaimed",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "_owner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isTokenAllowed",
    inputs: [
      {
        name: "_token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "_allowed",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isVaultAllowed",
    inputs: [
      {
        name: "_vault",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "_allowed",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "loanState",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "_s",
        type: "uint8",
        internalType: "enum IMicroloans.LoanState",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nextId",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "outstanding",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "reclaimGrant",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "releaseGrant",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "repay",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setBorrower",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_borrower",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setTokenAllowed",
    inputs: [
      {
        name: "_token",
        type: "address",
        internalType: "address",
      },
      {
        name: "_allowed",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setVaultAllowed",
    inputs: [
      {
        name: "_vault",
        type: "address",
        internalType: "address",
      },
      {
        name: "_allowed",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "BorrowerSet",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "borrower",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "GrantReclaimed",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "GrantReleased",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "borrower",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "LenderCollected",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "lender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "LoanAccepted",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "borrower",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "disbursed",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "repayBy",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "LoanCancelled",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "refunded",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "LoanCreated",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "lender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "borrower",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "terms",
        type: "tuple",
        indexed: false,
        internalType: "struct IMicroloans.LoanTerms",
        components: [
          {
            name: "token",
            type: "address",
            internalType: "address",
          },
          {
            name: "vault",
            type: "address",
            internalType: "address",
          },
          {
            name: "principal",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "grant",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "acceptBy",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "repaymentPeriod",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "termsHash",
            type: "bytes32",
            internalType: "bytes32",
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Repaid",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "payer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "totalRepaid",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RepayByExtended",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "repayBy",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenAllowed",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "allowed",
        type: "bool",
        indexed: true,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "VaultAllowed",
    inputs: [
      {
        name: "vault",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "allowed",
        type: "bool",
        indexed: true,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "YieldCredited",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "BorrowerAlreadySet",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidAcceptBy",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidAmount",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidBorrower",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidPrincipal",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidRepaymentPeriod",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidState",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidVault",
    inputs: [],
  },
  {
    type: "error",
    name: "LoanNotFound",
    inputs: [],
  },
  {
    type: "error",
    name: "NotBorrower",
    inputs: [],
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: [],
  },
  {
    type: "error",
    name: "NotLender",
    inputs: [],
  },
  {
    type: "error",
    name: "NothingToCollect",
    inputs: [],
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: [],
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "TermsMismatch",
    inputs: [],
  },
  {
    type: "error",
    name: "TokenNotAllowed",
    inputs: [],
  },
] as const;
