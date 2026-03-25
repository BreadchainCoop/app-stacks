import process from "node:process";
import { privateKeyToAccount } from "viem/accounts";
import { foundry, gnosis, sepolia } from "viem/chains";

const AUTOPAY_AUTH_DOMAIN_NAME = "StacksAutopayLit";
const AUTOPAY_AUTH_DOMAIN_VERSION = "1";
const AUTOPAY_ALL_CIRCLES_SENTINEL = 0n;

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function getChain() {
  const targetNetwork = process.env.NEXT_PUBLIC_TARGET_NETWORK || "gnosis";

  if (targetNetwork === "local") return foundry;
  if (targetNetwork === "sepolia") return sepolia;
  return gnosis;
}

function getContractConfig() {
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
        process.env
          .NEXT_PUBLIC_SEPOLIA_DELEGATED_SAVING_CIRCLES_CONTRACT_ADDRESS ||
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

function buildTypedData({
  circleId,
  scope,
  member,
  delegatedContract,
  savingCirclesContract,
  policyId,
  chainId,
}) {
  const signedCircleId =
    scope === "all_circles" ? AUTOPAY_ALL_CIRCLES_SENTINEL : circleId;

  return {
    domain: {
      name: AUTOPAY_AUTH_DOMAIN_NAME,
      version: AUTOPAY_AUTH_DOMAIN_VERSION,
      chainId,
      verifyingContract: savingCirclesContract,
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
      circleId:
        signedCircleId <= BigInt(Number.MAX_SAFE_INTEGER)
          ? Number(signedCircleId)
          : signedCircleId.toString(),
      scope,
      member,
      delegatedContract,
      policyId,
    },
  };
}

async function main() {
  const memberPrivateKey = getRequiredEnv("AUTOPAY_MEMBER_PRIVATE_KEY");
  const circleIdInput = getRequiredEnv("AUTOPAY_CIRCLE_ID");
  const baseUrl = process.env.AUTOPAY_BASE_URL || "http://localhost:3001";
  const scope = process.env.AUTOPAY_SCOPE || "circle";
  const policyId = getRequiredEnv("NEXT_PUBLIC_LIT_AUTOPAY_POLICY_ID");
  const { delegatedContract, savingCirclesContract } = getContractConfig();

  if (!delegatedContract || !savingCirclesContract) {
    throw new Error(
      "Missing delegated or saving circles contract address for selected network."
    );
  }

  if (scope !== "circle" && scope !== "all_circles") {
    throw new Error("AUTOPAY_SCOPE must be 'circle' or 'all_circles'.");
  }

  const account = privateKeyToAccount(
    memberPrivateKey.startsWith("0x")
      ? memberPrivateKey
      : `0x${memberPrivateKey}`
  );
  const chain = getChain();
  const circleId = BigInt(circleIdInput);
  const typedData = buildTypedData({
    circleId,
    scope,
    member: account.address,
    delegatedContract,
    savingCirclesContract,
    policyId,
    chainId: chain.id,
  });

  const signature = await account.signTypedData(typedData);

  const response = await fetch(`${baseUrl}/api/autopay/authorizations`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      circleId: circleId.toString(),
      member: account.address,
      scope,
      signature,
    }),
  });

  const json = await response.json();

  console.log(`Member: ${account.address}`);
  console.log(`Circle: ${circleId}`);
  console.log(`Scope: ${scope}`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Signature: ${signature}`);
  console.log("");
  console.log(JSON.stringify(json, null, 2));

  if (!response.ok || !json.success) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Failed to create autopay authorization:", error);
  process.exitCode = 1;
});
