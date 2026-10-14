export const conditionalGrantsAbi = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "DEADLINE_NOTICE_PERIOD",
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
    name: "MAX_PAY_BACK_PERIOD",
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
    name: "RECLAIM_GRACE_PERIOD",
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
    name: "STUCK_GRANT_PERIOD",
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
        name: "_grantTerms",
        type: "tuple",
        internalType: "struct IConditionalGrants.GrantTerms",
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
            name: "advance",
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
            name: "payBackPeriod",
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
        name: "_grantee",
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
    name: "extendPayBackBy",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_newPayBackBy",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getGrant",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "_grantTerms",
        type: "tuple",
        internalType: "struct IConditionalGrants.GrantTerms",
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
            name: "advance",
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
            name: "payBackPeriod",
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
        name: "_grantStatus",
        type: "tuple",
        internalType: "struct IConditionalGrants.GrantStatus",
        components: [
          {
            name: "grantor",
            type: "address",
            internalType: "address",
          },
          {
            name: "grantee",
            type: "address",
            internalType: "address",
          },
          {
            name: "acceptedAt",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "payBackBy",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "disbursed",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paidBack",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paidBackAt",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "held",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "grantorOwed",
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
    name: "getGranteeGrants",
    inputs: [
      {
        name: "_grantee",
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
    name: "getGrantorGrants",
    inputs: [
      {
        name: "_grantor",
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
    name: "grantState",
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
        internalType: "enum IConditionalGrants.GrantState",
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
    name: "payBack",
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
    name: "reclaimableAt",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "_timestamp",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
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
    name: "setGrantee",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_grantee",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPayBackBy",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_payBackBy",
        type: "uint256",
        internalType: "uint256",
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
    name: "AdvancePaidBack",
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
        name: "totalPaidBack",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "GrantAccepted",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "grantee",
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
        name: "payBackBy",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "GrantCancelled",
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
    name: "GrantCreated",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "grantor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "grantee",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "terms",
        type: "tuple",
        indexed: false,
        internalType: "struct IConditionalGrants.GrantTerms",
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
            name: "advance",
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
            name: "payBackPeriod",
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
        name: "grantee",
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
    name: "GranteeSet",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "grantee",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "GrantorCollected",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "grantor",
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
    name: "PayBackByExtended",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "payBackBy",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PayBackBySet",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "payBackBy",
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
    name: "GrantNotFound",
    inputs: [],
  },
  {
    type: "error",
    name: "GranteeAlreadySet",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidAcceptBy",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidAdvance",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidAmount",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidGrantee",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidPayBackPeriod",
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
    name: "NotGrantee",
    inputs: [],
  },
  {
    type: "error",
    name: "NotGrantor",
    inputs: [],
  },
  {
    type: "error",
    name: "NotInitializing",
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
    name: "ReclaimTooEarly",
    inputs: [],
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
