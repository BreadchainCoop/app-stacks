import process from "node:process";
import { createLitClient } from "@lit-protocol/lit-client";
import { naga, nagaDev, nagaTest } from "@lit-protocol/networks";

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
  const pkpIdentifierInput =
    process.env.LIT_AUTOPAY_PKP_PUBLIC_KEY || process.argv[2];

  if (!pkpIdentifierInput) {
    throw new Error(
      "Missing PKP identifier. Set LIT_AUTOPAY_PKP_PUBLIC_KEY or pass a pubkey/tokenId as the first argument."
    );
  }

  const pkpIdentifier =
    pkpIdentifierInput.startsWith("0x") && pkpIdentifierInput.length === 132
      ? { pubkey: pkpIdentifierInput }
      : pkpIdentifierInput.startsWith("0x") && pkpIdentifierInput.length === 42
        ? { address: pkpIdentifierInput }
        : { tokenId: pkpIdentifierInput };

  const { litNetwork, sdkLitNetwork } = getLitNetworkConfig();
  const litClient = await createLitClient({
    network: sdkLitNetwork,
  });

  const permissions = await litClient.viewPKPPermissions(pkpIdentifier);

  console.log(`Lit network: ${litNetwork}`);
  console.log(`PKP identifier: ${safeJson(pkpIdentifier)}`);
  console.log("");
  console.log(safeJson(permissions));
}

main().catch((error) => {
  console.error("Failed to inspect PKP permissions:", error);
  process.exitCode = 1;
});
