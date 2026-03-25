import process from "node:process";
import { createLitClient } from "@lit-protocol/lit-client";
import { naga, nagaDev, nagaTest } from "@lit-protocol/networks";
import { privateKeyToAccount } from "viem/accounts";

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

function safeJson(value) {
  return JSON.stringify(
    value,
    (_, nestedValue) =>
      typeof nestedValue === "bigint"
        ? nestedValue.toString()
        : nestedValue,
    2
  );
}

async function main() {
  const privateKey = process.env.AUTOPAY_WORKER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Missing AUTOPAY_WORKER_PRIVATE_KEY.");
  }

  const account = privateKeyToAccount(
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
  );
  const { litNetwork, sdkLitNetwork } = getLitNetworkConfig();
  const litClient = await createLitClient({
    network: sdkLitNetwork,
  });

  const result = await litClient.mintWithEoa({
    account,
  });

  const pkpData = result?.data ?? result?._raw?.data ?? result;
  const pubkey = pkpData?.pubkey || pkpData?.publicKey;
  const address = pkpData?.ethAddress || pkpData?.address;
  const tokenId = pkpData?.tokenId;

  console.log(`Lit network: ${litNetwork}`);
  console.log(`Worker EOA: ${account.address}`);
  console.log("");
  console.log("Mint result:");
  console.log(safeJson(result));

  if (pubkey) {
    console.log("");
    console.log("Use this in .env.local:");
    console.log(`LIT_AUTOPAY_PKP_PUBLIC_KEY=${pubkey}`);
  }

  if (address) {
    console.log(`PKP address: ${address}`);
  }

  if (tokenId) {
    console.log(`PKP tokenId: ${tokenId.toString()}`);
  }
}

main().catch((error) => {
  console.error("Failed to mint PKP:", error);
  process.exitCode = 1;
});
