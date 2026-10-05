/** Query param naming the chain a URL is scoped to. Defined here because this
 * module is the only thing that writes it. */
export const CHAIN_PARAM = "chain";

export const CHAIN_SLUGS: Record<number, string> = {
  100: "gnosis",
  42220: "celo",
  11155111: "sepolia",
  11142220: "celo-sepolia",
  31337: "local",
};

const SLUG_TO_CHAIN_ID = Object.fromEntries(
  Object.entries(CHAIN_SLUGS).map(([id, slug]) => [slug, Number(id)])
) as Record<string, number>;

/**
 * Slug for a chain id. Throws rather than inventing one: a fabricated slug
 * (the chain id as a string) is not something `chainIdFromSlug` can parse
 * back, so it would produce links that 404. `chainsSchema` refuses to boot a
 * deployment that configures a chain missing from CHAIN_SLUGS, which makes
 * this unreachable for configured chains — if it ever fires, the caller has
 * an id that isn't a chain.
 */
export const chainSlug = (chainId: number): string => {
  const slug = CHAIN_SLUGS[chainId];

  if (slug === undefined) {
    throw new Error(
      `No slug for chain ${chainId}. Add it to CHAIN_SLUGS in src/lib/chain-slugs.ts.`
    );
  }

  return slug;
};

export const chainIdFromSlug = (slug: string): number | undefined =>
  SLUG_TO_CHAIN_ID[slug];

/**
 * Attach the chain to an app-relative path, e.g. `/new` -> `/new?chain=celo`.
 *
 * Parsed rather than concatenated so a path that already carries a query string
 * keeps it: `"/stacks/5?name=x"` gains `&chain=`, not a second `?`.
 */
export const chainPath = (chainId: number, path: string): string => {
  // Any base works — only pathname/search/hash are read back out.
  const url = new URL(path, "https://stacks.invalid");
  url.searchParams.set(CHAIN_PARAM, chainSlug(chainId));

  return `${url.pathname}${url.search}${url.hash}`;
};
