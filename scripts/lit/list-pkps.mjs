import process from "node:process";
import { createLitClient } from "@lit-protocol/lit-client";
import { naga, nagaDev, nagaTest } from "@lit-protocol/networks";
import { ViemAccountAuthenticator } from "@lit-protocol/auth";
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

function normalizePkps(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.pkps)) return result.pkps;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  return [];
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
  const authData = await ViemAccountAuthenticator.authenticate(account);

  const [pkpsByAddress, pkpsByAuthData] = await Promise.all([
    litClient.viewPKPsByAddress({
      ownerAddress: account.address,
      pagination: { limit: 20, offset: 0 },
    }),
    litClient.viewPKPsByAuthData({
      authData,
      pagination: { limit: 20, offset: 0 },
    }),
  ]);

  const normalizedByAddress = normalizePkps(pkpsByAddress);
  const normalizedByAuth = normalizePkps(pkpsByAuthData);
  const merged = [...normalizedByAddress, ...normalizedByAuth];
  const deduped = new Map();

  for (const pkp of merged) {
    const key =
      pkp?.pubkey || pkp?.publicKey || pkp?.tokenId || JSON.stringify(pkp);
    if (!deduped.has(key)) {
      deduped.set(key, pkp);
    }
  }

  const pkps = [...deduped.values()];

  console.log(`Lit network: ${litNetwork}`);
  console.log(`Worker EOA: ${account.address}`);
  console.log(`Auth method id: ${authData.authMethodId}`);

  if (pkps.length === 0) {
    console.log("");
    console.log("No PKPs found for this worker wallet.");
    console.log(
      "Mint or attach a PKP to this auth method, then rerun this script."
    );
    return;
  }

  console.log("");
  console.log(`Found ${pkps.length} PKP(s):`);

  for (const [index, pkp] of pkps.entries()) {
    const pubkey = pkp?.pubkey || pkp?.publicKey || "";
    const ethAddress = pkp?.ethAddress || pkp?.address || "";
    const tokenId = pkp?.tokenId || "";

    console.log("");
    console.log(`#${index + 1}`);
    if (pubkey) console.log(`pubkey: ${pubkey}`);
    if (ethAddress) console.log(`address: ${ethAddress}`);
    if (tokenId) console.log(`tokenId: ${tokenId}`);
    console.log(`raw: ${JSON.stringify(pkp, null, 2)}`);
  }

  const first = pkps[0];
  const suggestedPubkey = first?.pubkey || first?.publicKey;
  if (suggestedPubkey) {
    console.log("");
    console.log("Suggested .env.local value:");
    console.log(`LIT_AUTOPAY_PKP_PUBLIC_KEY=${suggestedPubkey}`);
  }
}

main().catch((error) => {
  console.error("Failed to list PKPs:", error);
  process.exitCode = 1;
});
