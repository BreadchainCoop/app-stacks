export const savingCirclesViewerAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_savingCircles",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "SAVING_CIRCLES",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract SavingCircles",
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
    name: "getComprehensiveUserData",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "userData",
        type: "tuple",
        internalType: "struct ISavingCirclesViewer.ComprehensiveUserData",
        components: [
          {
            name: "userAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "financialSummary",
            type: "tuple",
            internalType: "struct ISavingCirclesViewer.UserFinancialSummary",
            components: [
              {
                name: "totalBalance",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalDeposited",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalWithdrawn",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "activeCirclesCount",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "ownedCirclesCount",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "completedCirclesCount",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "pendingWithdrawals",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "upcomingDeposits",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "membershipStatus",
            type: "tuple",
            internalType: "struct ISavingCirclesViewer.UserMembershipStatus",
            components: [
              {
                name: "allCircleIds",
                type: "uint256[]",
                internalType: "uint256[]",
              },
              {
                name: "activeCircleIds",
                type: "uint256[]",
                internalType: "uint256[]",
              },
              {
                name: "ownedCircleIds",
                type: "uint256[]",
                internalType: "uint256[]",
              },
              {
                name: "withdrawableCircleIds",
                type: "uint256[]",
                internalType: "uint256[]",
              },
              {
                name: "expiredCircleIds",
                type: "uint256[]",
                internalType: "uint256[]",
              },
              {
                name: "decommissionedCircleIds",
                type: "uint256[]",
                internalType: "uint256[]",
              },
              {
                name: "decommissionableCircleIds",
                type: "uint256[]",
                internalType: "uint256[]",
              },
            ],
          },
          {
            name: "circleData",
            type: "tuple[]",
            internalType: "struct ISavingCirclesViewer.UserCircleData[]",
            components: [
              {
                name: "circleId",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "circleInfo",
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
              {
                name: "userBalance",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "isMember",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "isOwner",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "isCurrentWithdrawer",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "canWithdraw",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "isExpired",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "isDecommissioned",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "isDecommissionable",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "nextWithdrawTime",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "depositWindowEnd",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalPoolBalance",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "remainingDepositsNeeded",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "completedRounds",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "totalRounds",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "timestamp",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "blockNumber",
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
    name: "getTotalBalance",
    inputs: [
      {
        name: "_member",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "_totalBalance",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserCircleData",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
      {
        name: "_circleId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "circleData",
        type: "tuple",
        internalType: "struct ISavingCirclesViewer.UserCircleData",
        components: [
          {
            name: "circleId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "circleInfo",
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
          {
            name: "userBalance",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "isMember",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "isOwner",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "isCurrentWithdrawer",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "canWithdraw",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "isExpired",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "isDecommissioned",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "isDecommissionable",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "nextWithdrawTime",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "depositWindowEnd",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalPoolBalance",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "remainingDepositsNeeded",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "completedRounds",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalRounds",
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
    name: "getUserCirclesData",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
      {
        name: "_circleIds",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    outputs: [
      {
        name: "circleDataArray",
        type: "tuple[]",
        internalType: "struct ISavingCirclesViewer.UserCircleData[]",
        components: [
          {
            name: "circleId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "circleInfo",
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
          {
            name: "userBalance",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "isMember",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "isOwner",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "isCurrentWithdrawer",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "canWithdraw",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "isExpired",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "isDecommissioned",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "isDecommissionable",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "nextWithdrawTime",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "depositWindowEnd",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalPoolBalance",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "remainingDepositsNeeded",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "completedRounds",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalRounds",
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
    name: "getUserFinancialSummary",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "summary",
        type: "tuple",
        internalType: "struct ISavingCirclesViewer.UserFinancialSummary",
        components: [
          {
            name: "totalBalance",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalDeposited",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalWithdrawn",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "activeCirclesCount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "ownedCirclesCount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "completedCirclesCount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "pendingWithdrawals",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "upcomingDeposits",
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
    name: "getUserMembershipStatus",
    inputs: [
      {
        name: "_user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "status",
        type: "tuple",
        internalType: "struct ISavingCirclesViewer.UserMembershipStatus",
        components: [
          {
            name: "allCircleIds",
            type: "uint256[]",
            internalType: "uint256[]",
          },
          {
            name: "activeCircleIds",
            type: "uint256[]",
            internalType: "uint256[]",
          },
          {
            name: "ownedCircleIds",
            type: "uint256[]",
            internalType: "uint256[]",
          },
          {
            name: "withdrawableCircleIds",
            type: "uint256[]",
            internalType: "uint256[]",
          },
          {
            name: "expiredCircleIds",
            type: "uint256[]",
            internalType: "uint256[]",
          },
          {
            name: "decommissionedCircleIds",
            type: "uint256[]",
            internalType: "uint256[]",
          },
          {
            name: "decommissionableCircleIds",
            type: "uint256[]",
            internalType: "uint256[]",
          },
        ],
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
    type: "error",
    name: "NotActive",
    inputs: [],
  },
] as const;
