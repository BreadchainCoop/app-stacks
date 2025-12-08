export const StacksAbi =
  [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "inputs": [], "name": "AlreadyDeposited", "type": "error" },
  { "inputs": [], "name": "AlreadyExists", "type": "error" },
  { "inputs": [], "name": "CircleExpired", "type": "error" },
  { "inputs": [], "name": "DepositBeforeCircleStart", "type": "error" },
  { "inputs": [], "name": "DepositWindowClosed", "type": "error" },
  { "inputs": [], "name": "ExceedsDepositAmount", "type": "error" },
  { "inputs": [], "name": "InvalidCircle", "type": "error" },
  { "inputs": [], "name": "InvalidCircleStartTime", "type": "error" },
  { "inputs": [], "name": "InvalidCurrentIndex", "type": "error" },
  { "inputs": [], "name": "InvalidDeposit", "type": "error" },
  { "inputs": [], "name": "InvalidDepositAmount", "type": "error" },
  { "inputs": [], "name": "InvalidDepositInterval", "type": "error" },
  { "inputs": [], "name": "InvalidInitialization", "type": "error" },
  { "inputs": [], "name": "InvalidMaxDeposits", "type": "error" },
  { "inputs": [], "name": "InvalidMemberAddress", "type": "error" },
  { "inputs": [], "name": "InvalidMemberCount", "type": "error" },
  { "inputs": [], "name": "InvalidOwner", "type": "error" },
  { "inputs": [], "name": "NotCommissioned", "type": "error" },
  { "inputs": [], "name": "NotDecommissionable", "type": "error" },
  { "inputs": [], "name": "NotInitializing", "type": "error" },
  { "inputs": [], "name": "NotMember", "type": "error" },
  { "inputs": [], "name": "NotWithdrawable", "type": "error" },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  { "inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error" },
  { "inputs": [], "name": "TokenNotAllowed", "type": "error" },
  { "inputs": [], "name": "TransferFailed", "type": "error" },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "members",
        "type": "address[]"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "depositAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "depositInterval",
        "type": "uint256"
      }
    ],
    "name": "CircleCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "CircleDecommissioned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "member",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsDeposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "member",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "version",
        "type": "uint64"
      }
    ],
    "name": "Initialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bool",
        "name": "allowed",
        "type": "bool"
      }
    ],
    "name": "TokenAllowed",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MINIMUM_MEMBERS",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" }
    ],
    "name": "allowedTokens",
    "outputs": [{ "internalType": "bool", "name": "status", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "address", "name": "token", "type": "address" }
    ],
    "name": "balances",
    "outputs": [
      { "internalType": "uint256", "name": "balance", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_member", "type": "address" },
      { "internalType": "uint256[]", "name": "_ids", "type": "uint256[]" }
    ],
    "name": "checkMemberships",
    "outputs": [
      { "internalType": "bool[]", "name": "_statuses", "type": "bool[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "circles",
    "outputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "uint256", "name": "currentIndex", "type": "uint256" },
      { "internalType": "uint256", "name": "depositAmount", "type": "uint256" },
      { "internalType": "address", "name": "token", "type": "address" },
      {
        "internalType": "uint256",
        "name": "depositInterval",
        "type": "uint256"
      },
      { "internalType": "uint256", "name": "circleStart", "type": "uint256" },
      { "internalType": "uint256", "name": "maxDeposits", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "owner", "type": "address" },
          {
            "internalType": "address[]",
            "name": "members",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "currentIndex",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "depositAmount",
            "type": "uint256"
          },
          { "internalType": "address", "name": "token", "type": "address" },
          {
            "internalType": "uint256",
            "name": "depositInterval",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "circleStart",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxDeposits",
            "type": "uint256"
          }
        ],
        "internalType": "struct ISavingCircles.Circle",
        "name": "_circle",
        "type": "tuple"
      }
    ],
    "name": "create",
    "outputs": [
      { "internalType": "uint256", "name": "_id", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "decommission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_id", "type": "uint256" },
      { "internalType": "uint256", "name": "_value", "type": "uint256" }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_id", "type": "uint256" },
      { "internalType": "uint256", "name": "_value", "type": "uint256" },
      { "internalType": "address", "name": "_member", "type": "address" }
    ],
    "name": "depositFor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "getCircle",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "owner", "type": "address" },
          {
            "internalType": "address[]",
            "name": "members",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "currentIndex",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "depositAmount",
            "type": "uint256"
          },
          { "internalType": "address", "name": "token", "type": "address" },
          {
            "internalType": "uint256",
            "name": "depositInterval",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "circleStart",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxDeposits",
            "type": "uint256"
          }
        ],
        "internalType": "struct ISavingCircles.Circle",
        "name": "_circle",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256[]", "name": "_ids", "type": "uint256[]" }
    ],
    "name": "getCircles",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "owner", "type": "address" },
          {
            "internalType": "address[]",
            "name": "members",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "currentIndex",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "depositAmount",
            "type": "uint256"
          },
          { "internalType": "address", "name": "token", "type": "address" },
          {
            "internalType": "uint256",
            "name": "depositInterval",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "circleStart",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxDeposits",
            "type": "uint256"
          }
        ],
        "internalType": "struct ISavingCircles.Circle[]",
        "name": "_circles",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "getMemberBalances",
    "outputs": [
      { "internalType": "address[]", "name": "_members", "type": "address[]" },
      { "internalType": "uint256[]", "name": "_balances", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_member", "type": "address" }
    ],
    "name": "getMemberCircles",
    "outputs": [
      { "internalType": "uint256[]", "name": "_ids", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_owner", "type": "address" }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "address", "name": "member", "type": "address" }
    ],
    "name": "isMember",
    "outputs": [{ "internalType": "bool", "name": "status", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_token", "type": "address" }
    ],
    "name": "isTokenAllowed",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "isWithdrawable",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "member", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "memberCircles",
    "outputs": [
      { "internalType": "uint256", "name": "ids", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_token", "type": "address" },
      { "internalType": "bool", "name": "_allowed", "type": "bool" }
    ],
    "name": "setTokenAllowed",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_id", "type": "uint256" },
      { "internalType": "address", "name": "_member", "type": "address" }
    ],
    "name": "withdrawFor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "withdrawableBy",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
];
