import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
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

function getKey(circleId, member) {
  return `${circleId.toString()}:${member.toLowerCase()}`;
}

function buildTypedData({
  circleId,
  member,
  delegatedContract,
  verifyingContract,
  policyId,
  chainId,
}) {
  const safeCircleId =
    circleId <= BigInt(Number.MAX_SAFE_INTEGER)
      ? Number(circleId)
      : circleId.toString();

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
        { name: "member", type: "address" },
        { name: "delegatedContract", type: "address" },
        { name: "policyId", type: "string" },
      ],
    },
    primaryType: "AutopayAuthorization",
    message: {
      circleId: safeCircleId,
      member,
      delegatedContract,
      policyId,
    },
  };
}

async function main() {
  const { delegatedContract, savingCirclesContract } =
    getSelectedContractConfig();
  const litPolicyId = process.env.NEXT_PUBLIC_LIT_AUTOPAY_POLICY_ID;
  const litNetwork = process.env.NEXT_PUBLIC_LIT_AUTOPAY_NETWORK;
  const privateKey = process.env.AUTOPAY_WORKER_PRIVATE_KEY;
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
    const auth = store.authorizations[key];

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
        circleId,
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
          "Skipped: saved Lit authorization signature no longer verifies.",
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
