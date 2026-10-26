// The site that serves each chain. Each browser/chain pairing is its own
// deployment — the web site serves the Privy chains, the mini site serves Celo
// for MiniPay, the nimiq site serves Polygon for Nimiq Pay — and the chain
// already says which tier it belongs to. A site sends `?chain=` links for a
// chain it doesn't configure to the site that does (next.config.ts), and takes
// its own origin from here for link previews (src/utils/metadata.ts). A chain
// with no entry, like local, is never redirected.
//
// Origins only, with no trailing slash: a redirect appends the request's path.
// No imports, because next.config.ts loads this.
export const CHAIN_SITES: Record<number, string> = {
  100: "https://stacks.bread.coop",
  42220: "https://mini.stacks.bread.coop",
  11155111: "https://development.stacks.bread.coop",
  11142220: "https://mini-development.stacks.bread.coop",
  137: "https://nimiq.stacks.bread.coop",
};
