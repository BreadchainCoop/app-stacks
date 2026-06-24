export const savingCirclesAbi = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "MINIMUM_MEMBERS",
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
    name: "allowedTokens",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "status",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balances",
    inputs: [
      {
        name: "id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "balance",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "checkMemberships",
    inputs: [
      {
        name: "_member",
        type: "address",
        internalType: "address",
      },
      {
        name: "_ids",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    outputs: [
      {
        name: "_statuses",
        type: "bool[]",
        internalType: "bool[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "circleMembers",
    inputs: [
      {
        name: "id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "members",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "circles",
    inputs: [
      {
        name: "id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "currentIndex",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "depositAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "depositInterval",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "effectiveCircleStartTime",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "circleEnd",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "create",
    inputs: [
      {
        name: "_circle",
        type: "tuple",
        internalType: "struct ISavingCircles.Circle",
        components: [
          {
            name: "owner",
            type: "address",
            internalType: "address",
          },
          {
            name: "currentIndex",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "depositAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "token",
            type: "address",
            internalType: "address",
          },
          {
            name: "depositInterval",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "effectiveCircleStartTime",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "circleEnd",
            type: "uint256",
            internalType: "uint256",
          },
        ],
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
    name: "decommission",
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
    name: "deposit",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_value",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositFor",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_member",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "eip712Domain",
    inputs: [],
    outputs: [
      {
        name: "fields",
        type: "bytes1",
        internalType: "bytes1",
      },
      {
        name: "name",
        type: "string",
        internalType: "string",
      },
      {
        name: "version",
        type: "string",
        internalType: "string",
      },
      {
        name: "chainId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "verifyingContract",
        type: "address",
        internalType: "address",
      },
      {
        name: "salt",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "extensions",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCircle",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "_circle",
        type: "tuple",
        internalType: "struct ISavingCircles.Circle",
        components: [
          {
            name: "owner",
            type: "address",
            internalType: "address",
          },
          {
            name: "currentIndex",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "depositAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "token",
            type: "address",
            internalType: "address",
          },
          {
            name: "depositInterval",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "effectiveCircleStartTime",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "circleEnd",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCircleMembers",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "members",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCircles",
    inputs: [
      {
        name: "_ids",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    outputs: [
      {
        name: "_circles",
        type: "tuple[]",
        internalType: "struct ISavingCircles.Circle[]",
        components: [
          {
            name: "owner",
            type: "address",
            internalType: "address",
          },
          {
            name: "currentIndex",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "depositAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "token",
            type: "address",
            internalType: "address",
          },
          {
            name: "depositInterval",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "effectiveCircleStartTime",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "circleEnd",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMemberBalances",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "_members",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "_balances",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMemberCircles",
    inputs: [
      {
        name: "_member",
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
    name: "isActive",
    inputs: [
      {
        name: "id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "active",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isDecommissionable",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isDecommissioned",
    inputs: [
      {
        name: "_circle",
        type: "tuple",
        internalType: "struct ISavingCircles.Circle",
        components: [
          {
            name: "owner",
            type: "address",
            internalType: "address",
          },
          {
            name: "currentIndex",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "depositAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "token",
            type: "address",
            internalType: "address",
          },
          {
            name: "depositInterval",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "effectiveCircleStartTime",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "circleEnd",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "isMember",
    inputs: [
      {
        name: "id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "member",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "status",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasClaimed",
    inputs: [
      {
        name: "id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "member",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "claimed",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
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
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isWithdrawable",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "memberCircles",
    inputs: [
      {
        name: "member",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "ids",
        type: "uint256",
        internalType: "uint256",
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
    name: "redeemInvite",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_nonce",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_signature",
        type: "bytes",
        internalType: "bytes",
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
    name: "start",
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
    type: "function",
    name: "usedNonces",
    inputs: [
      {
        name: "id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "nonce",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "used",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdraw",
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
    name: "withdrawFor",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_member",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawableBy",
    inputs: [
      {
        name: "_id",
        type: "uint256",
        internalType: "uint256",
      },
    ],
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
    type: "event",
    name: "CircleCreated",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "token",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "depositAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "depositInterval",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CircleDecommissioned",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CircleStarted",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EIP712DomainChanged",
    inputs: [],
    anonymous: false,
  },
  {
    type: "event",
    name: "FundsDeposited",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "member",
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
    name: "FundsWithdrawn",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "member",
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
    name: "InviteRedeemed",
    inputs: [
      {
        name: "id",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "redeemer",
        type: "address",
        indexed: true,
        internalType: "address",
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
    type: "error",
    name: "AlreadyActive",
    inputs: [],
  },
  {
    type: "error",
    name: "AlreadyDeposited",
    inputs: [],
  },
  {
    type: "error",
    name: "AlreadyExists",
    inputs: [],
  },
  {
    type: "error",
    name: "AlreadyMember",
    inputs: [],
  },
  {
    type: "error",
    name: "CircleExpired",
    inputs: [],
  },
  {
    type: "error",
    name: "DepositBeforeCircleStart",
    inputs: [],
  },
  {
    type: "error",
    name: "DepositWindowClosed",
    inputs: [],
  },
  {
    type: "error",
    name: "CircleTimedOut",
    inputs: [],
  },
  {
    type: "error",
    name: "ECDSAInvalidSignature",
    inputs: [],
  },
  {
    type: "error",
    name: "ECDSAInvalidSignatureLength",
    inputs: [
      {
        name: "length",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "ECDSAInvalidSignatureS",
    inputs: [
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "ExceedsDepositAmount",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidCircle",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidCircleStartTime",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidCurrentIndex",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidDeposit",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidDepositAmount",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidDepositInterval",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidMemberAddress",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidMemberCount",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidOwner",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidSigner",
    inputs: [],
  },
  {
    type: "error",
    name: "InviteAlreadyUsed",
    inputs: [],
  },
  {
    type: "error",
    name: "NotActive",
    inputs: [],
  },
  {
    type: "error",
    name: "NotCommissioned",
    inputs: [],
  },
  {
    type: "error",
    name: "NotDecommissionable",
    inputs: [],
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: [],
  },
  {
    type: "error",
    name: "NotMember",
    inputs: [],
  },
  {
    type: "error",
    name: "NotOwner",
    inputs: [],
  },
  {
    type: "error",
    name: "NotWithdrawable",
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
    name: "TokenNotAllowed",
    inputs: [],
  },
  {
    type: "error",
    name: "TransferFailed",
    inputs: [],
  },
] as const;
