/* Pre-flight for a journey run: check the chain, the deployed contracts and the
 * app's E2E wallet gate, then top the two test wallets up with gas and BREAD.
 * Exits non-zero (with a fix-it message) when the environment is not usable.
 */
const L = require("./lib.cjs");

const REQUIRED = [
  ["BREAD token", L.A.bread],
  ["AccumulatingSavingCircles", L.A.asca],
  ["GoalSavingCircles", L.A.goal],
  ["CollectiveFundCircles", L.A.collective],
];

(async () => {
  const chainId = await L.pub.getChainId();
  if (chainId !== L.CHAIN_ID)
    throw new Error(
      `chain id ${chainId} at ${L.RPC}, expected ${L.CHAIN_ID} — is this the right anvil?`
    );
  console.log(
    `  chain ${chainId} @ ${L.RPC}, block ${await L.pub.getBlockNumber()}`
  );

  for (const [label, address] of REQUIRED) {
    if (!address) throw new Error(`${label}: no address in .env.local`);
    const code = await L.pub.getCode({ address });
    if (!code || code === "0x")
      throw new Error(
        `${label}: no contract code at ${address} — run 'make deploy'`
      );
  }
  console.log("  all four contracts are deployed");

  if (L.appEnv.NEXT_PUBLIC_E2E_WALLET !== "true")
    throw new Error(
      "NEXT_PUBLIC_E2E_WALLET is not 'true' in .env.local — the app would " +
        "require a Privy login and no injected wallet could sign"
    );

  for (const [label, signer] of [
    ["owner ", L.owner],
    ["member", L.member],
  ]) {
    await L.fork.fund(signer.account.address, { eth: 100n, bread: 500n });
    const bread = await L.R.breadBalance(signer.account.address);
    console.log(
      `  ${label} ${signer.account.address}  ${bread / 10n ** 18n} BREAD`
    );
  }
  // Keep the funder itself solvent across runs.
  await L.fork.setBalance(L.admin.account.address, 100n * 10n ** 18n);
})().catch((error) => {
  console.error("  ✗", error.message);
  process.exit(1);
});
