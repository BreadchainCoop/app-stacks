// Which chains this deployment serves, read straight from the env blob.
//
// Deliberately goes through neither clientEnv nor serverEnv: this is needed in
// the edge middleware, in server components, and in the browser, and those
// modules each work in only some of those places. NEXT_PUBLIC_* values are
// inlined at build time in all three.
export const CONFIGURED_CHAIN_IDS: number[] = (() => {
  try {
    return Object.keys(JSON.parse(process.env.NEXT_PUBLIC_CHAINS ?? "{}")).map(
      Number
    );
  } catch {
    return [];
  }
})();

export const isConfiguredChain = (chainId: number): boolean =>
  CONFIGURED_CHAIN_IDS.includes(chainId);
