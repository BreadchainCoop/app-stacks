import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createLitClient } from "@lit-protocol/lit-client";
import { naga, nagaDev, nagaTest } from "@lit-protocol/networks";
import {
  createAuthManager,
  storagePlugins,
} from "@lit-protocol/auth";
import {
  createPublicClient,
  createWalletClient,
  getAddress,
  http,
  isAddress,
  verifyTypedData,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry, gnosis, sepolia } from "viem/chains";
import { litAutopayPolicyActionCode } from "./lit/autopay-policy.mjs";

const delegatedSavingCirclesAbi = [
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
];

const AUTOPAY_AUTH_DOMAIN_NAME = "StacksAutopayLit";
const AUTOPAY_AUTH_DOMAIN_VERSION = "1";
const AUTOPAY_ALL_CIRCLES_SENTINEL = 0n;
const storeDir = path.join(process.cwd(), ".autopay-data");
const storePath = path.join(storeDir, "autopay-state.json");

function getChainConfig() {
  const targetNetwork = process.env.NEXT_PUBLIC_TARGET_NETWORK || "gnosis";

  if (targetNetwork === "local") {
    return {
      chain: foundry,
      rpcUrl:
        process.env.AUTOPAY_WORKER_RPC_URL ||
        process.env.NEXT_PUBLIC_LOCAL_RPC_URL ||
        "http://localhost:8545",
    };
  }

  if (targetNetwork === "sepolia") {
    return {
      chain: sepolia,
      rpcUrl:
        process.env.AUTOPAY_WORKER_RPC_URL ||
        process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
    };
  }

  return {
    chain: gnosis,
    rpcUrl:
      process.env.AUTOPAY_WORKER_RPC_URL ||
      process.env.NEXT_PUBLIC_GNOSIS_RPC_URL,
  };
}

function getSelectedContractConfig() {
  const targetNetwork = process.env.NEXT_PUBLIC_TARGET_NETWORK || "gnosis";

  if (targetNetwork === "local") {
    return {
      delegatedContract:
        process.env.NEXT_PUBLIC_LOCAL_DELEGATED_SAVING_CIRCLES_CONTRACT_ADDRESS ||
        process.env.NEXT_PUBLIC_DELEGATED_SAVING_CIRCLES_CONTRACT_ADDRESS,
      savingCirclesContract:
        process.env.NEXT_PUBLIC_LOCAL_SAVING_CIRCLES_CONTRACT_ADDRESS ||
        process.env.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
    };
  }

  if (targetNetwork === "sepolia") {
    return {
      delegatedContract:
        process.env.NEXT_PUBLIC_SEPOLIA_DELEGATED_SAVING_CIRCLES_CONTRACT_ADDRESS ||
        process.env.NEXT_PUBLIC_DELEGATED_SAVING_CIRCLES_CONTRACT_ADDRESS,
      savingCirclesContract:
        process.env.NEXT_PUBLIC_SEPOLIA_SAVING_CIRCLES_CONTRACT_ADDRESS ||
        process.env.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
    };
  }

  return {
    delegatedContract:
      process.env.NEXT_PUBLIC_DELEGATED_SAVING_CIRCLES_CONTRACT_ADDRESS,
    savingCirclesContract:
      process.env.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
  };
}

function getLitNetworkConfig() {
  const litNetwork = process.env.NEXT_PUBLIC_LIT_AUTOPAY_NETWORK || "naga-dev";
  const networkMap = {
    naga,
    "naga-dev": nagaDev,
    "naga-test": nagaTest,
  };

  return {
    litNetwork,
    sdkLitNetwork: networkMap[litNetwork] ?? nagaDev,
  };
}

async function readStore() {
  try {
    const raw = await readFile(storePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return { authorizations: {}, results: {} };
  }
}

async function writeStore(store) {
  await mkdir(storeDir, { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

function getKey(circleId, member, scope = "circle") {
  if (scope === "all_circles") {
    return `all:${member.toLowerCase()}`;
  }

  return `${circleId.toString()}:${member.toLowerCase()}`;
}

function buildTypedData({
  circleId,
  scope = "circle",
  member,
  delegatedContract,
  verifyingContract,
  policyId,
  chainId,
}) {
  const signedCircleId =
    scope === "all_circles" ? AUTOPAY_ALL_CIRCLES_SENTINEL : circleId;
  const safeCircleId =
    signedCircleId <= BigInt(Number.MAX_SAFE_INTEGER)
      ? Number(signedCircleId)
      : signedCircleId.toString();

  return {
    domain: {
      name: AUTOPAY_AUTH_DOMAIN_NAME,
      version: AUTOPAY_AUTH_DOMAIN_VERSION,
      chainId,
      verifyingContract,
    },
    types: {
      AutopayAuthorization: [
        { name: "circleId", type: "uint256" },
        { name: "scope", type: "string" },
        { name: "member", type: "address" },
        { name: "delegatedContract", type: "address" },
        { name: "policyId", type: "string" },
      ],
    },
    primaryType: "AutopayAuthorization",
    message: {
      circleId: safeCircleId,
      scope,
      member,
      delegatedContract,
      policyId,
    },
  };
}

async function buildLitAuthContext({ litClient, account, litNetwork }) {
  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: "bread-autopay-worker",
      networkName: litNetwork,
      storagePath: path.join(process.cwd(), ".lit-auth"),
    }),
  });

  return authManager.createEoaAuthContext({
    litClient,
    config: {
      account,
    },
    authConfig: {
      domain: "localhost",
      statement: "Authorize Lit autopay policy execution",
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
      resources: [["lit-action-execution", "*"]],
    },
  });
}

async function evaluateLitAutopayPolicy({
  litClient,
  authContext,
  authorization,
  candidate,
  userMaxPriceWei,
}) {
  const result = await litClient.executeJs({
    authContext,
    code: litAutopayPolicyActionCode,
    jsParams: {
      authorization,
      candidate,
    },
    responseStrategy: { strategy: "leastCommon" },
    useSingleNode: false,
    userMaxPrice: userMaxPriceWei,
  });

  const parsed =
    typeof result.response === "string"
      ? JSON.parse(result.response)
      : result.response;

  return {
    authorized: Boolean(parsed?.authorized),
    reason:
      typeof parsed?.reason === "string"
        ? parsed.reason
        : "Lit policy did not authorize execution.",
  };
}

async function main() {
  const { delegatedContract, savingCirclesContract } =
    getSelectedContractConfig();
  const litPolicyId = process.env.NEXT_PUBLIC_LIT_AUTOPAY_POLICY_ID;
  const { litNetwork, sdkLitNetwork } = getLitNetworkConfig();
  const privateKey = process.env.AUTOPAY_WORKER_PRIVATE_KEY;
  const userMaxPriceWei = BigInt(
    process.env.LIT_AUTOPAY_USER_MAX_PRICE_WEI || "30000000000000000"
  );
  const { chain, rpcUrl } = getChainConfig();

  if (
    !delegatedContract ||
    !savingCirclesContract ||
    !litPolicyId ||
    !litNetwork
  ) {
    throw new Error(
      "Missing delegated contract or Lit autopay env vars. Check .env.local before running the worker."
    );
  }
  if (!rpcUrl || !privateKey) {
    throw new Error("Missing AUTOPAY_WORKER RPC or private key configuration.");
  }
  if (!isAddress(delegatedContract) || !isAddress(savingCirclesContract)) {
    throw new Error("Autopay contract addresses must be valid EVM addresses.");
  }

  const account = privateKeyToAccount(
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
  );
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });
  const litClient = await createLitClient({
    network: sdkLitNetwork,
  });
  const litAuthContext = await buildLitAuthContext({
    litClient,
    account,
    litNetwork,
  });

  const store = await readStore();
  const [circleIds, members] = await publicClient.readContract({
    address: getAddress(delegatedContract),
    abi: delegatedSavingCirclesAbi,
    functionName: "getAddressesForDeposit",
  });

  const eligibleCircleIds = [];
  const eligibleMembers = [];

  for (let i = 0; i < members.length; i += 1) {
    const member = getAddress(members[i]);
    const circleId = circleIds[i];
    const key = getKey(circleId, member);
    const allCirclesKey = getKey(circleId, member, "all_circles");
    const auth =
      store.authorizations[key] ?? store.authorizations[allCirclesKey];

    if (!auth?.active) {
      store.results[key] = {
        circleId: circleId.toString(),
        member,
        status: "skipped",
        message: "Skipped: no active Lit authorization recorded.",
        updatedAt: new Date().toISOString(),
        executor: account.address,
      };
      continue;
    }

    const validSignature = await verifyTypedData({
      ...buildTypedData({
        circleId:
          auth.scope === "all_circles"
            ? AUTOPAY_ALL_CIRCLES_SENTINEL
            : BigInt(auth.circleId),
        scope: auth.scope ?? "circle",
        member,
        delegatedContract: getAddress(delegatedContract),
        verifyingContract: getAddress(savingCirclesContract),
        policyId: litPolicyId,
        chainId: chain.id,
      }),
      address: member,
      signature: auth.signature,
    });

    if (!validSignature) {
      store.results[key] = {
        circleId: circleId.toString(),
        member,
        status: "skipped",
        message:
          "Skipped: saved Lit authorization signature no longer verifies for the selected scope.",
        updatedAt: new Date().toISOString(),
        executor: account.address,
      };
      continue;
    }

    const litDecision = await evaluateLitAutopayPolicy({
      litClient,
      authContext: litAuthContext,
      userMaxPriceWei,
      authorization: {
        active: auth.active,
        member: auth.member,
        circleId: auth.circleId,
        scope: auth.scope ?? "circle",
        delegatedContract: auth.delegatedContract,
        savingCirclesContract: auth.savingCirclesContract,
        chainId: auth.chainId,
        litPolicyId: auth.litPolicyId,
      },
      candidate: {
        member,
        circleId: circleId.toString(),
        delegatedContract: getAddress(delegatedContract),
        savingCirclesContract: getAddress(savingCirclesContract),
        chainId: chain.id,
        litPolicyId,
      },
    });

    if (!litDecision.authorized) {
      store.results[key] = {
        circleId: circleId.toString(),
        member,
        status: "skipped",
        message: `Skipped by Lit policy: ${litDecision.reason}`,
        updatedAt: new Date().toISOString(),
        executor: account.address,
      };
      continue;
    }

    eligibleCircleIds.push(circleId);
    eligibleMembers.push(member);
  }

  if (eligibleMembers.length === 0) {
    await writeStore(store);
    console.log(
      "No eligible delegated deposits with active Lit authorization."
    );
    return;
  }

  try {
    let txHash;

    if (eligibleMembers.length === 1) {
      const { request } = await publicClient.simulateContract({
        account,
        address: getAddress(delegatedContract),
        abi: delegatedSavingCirclesAbi,
        functionName: "depositIfAllowed",
        args: [eligibleCircleIds[0], eligibleMembers[0]],
      });

      txHash = await walletClient.writeContract(request);
    } else {
      const { request } = await publicClient.simulateContract({
        account,
        address: getAddress(delegatedContract),
        abi: delegatedSavingCirclesAbi,
        functionName: "batchDepositIfAllowed",
        args: [eligibleCircleIds, eligibleMembers],
      });

      txHash = await walletClient.writeContract(request);
    }

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    for (let i = 0; i < eligibleMembers.length; i += 1) {
      const key = getKey(eligibleCircleIds[i], eligibleMembers[i]);
      store.results[key] = {
        circleId: eligibleCircleIds[i].toString(),
        member: eligibleMembers[i],
        status: "success",
        message: `Automated deposit executed on ${litNetwork} Lit policy ${litPolicyId}.`,
        updatedAt: new Date().toISOString(),
        txHash,
        executor: account.address,
      };
    }

    await writeStore(store);
    console.log(
      `Executed ${eligibleMembers.length} delegated deposit(s) in tx ${txHash}.`
    );
  } catch (error) {
    for (let i = 0; i < eligibleMembers.length; i += 1) {
      const key = getKey(eligibleCircleIds[i], eligibleMembers[i]);
      store.results[key] = {
        circleId: eligibleCircleIds[i].toString(),
        member: eligibleMembers[i],
        status: "error",
        message:
          error instanceof Error ? error.message : "Worker execution failed.",
        updatedAt: new Date().toISOString(),
        executor: account.address,
      };
    }

    await writeStore(store);
    throw error;
  }
}

main().catch((error) => {
  console.error("Autopay worker failed:", error);
  process.exitCode = 1;
});
