import { polygon } from "viem/chains";

// Nimiq Pay runs mini apps in its in-app WebView. It injects an EIP-1193
// wallet at `window.ethereum` (EIP-6963 discoverable too) and its own
// `window.nimiqPay` object (language, network, fullscreen), both before page
// scripts run. Unlike MiniPay it can sign messages, including EIP-712.

/**
 * Chains whose stacks work only inside Nimiq Pay, as Celo's work only inside
 * MiniPay: Polygon, where the deposit token is the USDT Nimiq Pay users hold.
 * Nimiq Pay also serves the Privy chains (Gnosis, Sepolia), but those are not
 * exclusive to it.
 */
export const isNimiqPayChain = (chainId: number): boolean =>
  chainId === polygon.id;

/**
 * A link that opens `url` inside Nimiq Pay, so someone tapping it on their
 * phone lands in the mini app rather than in their browser. Where the phone
 * doesn't hand the link to Nimiq Pay (no app, a desktop, a link shortener's
 * redirect), nimpay.app serves an "Open in Nimiq Pay" page, but only for sites
 * listed in Nimiq's mini app directory (nimiq/awesome); any other host gets a
 * 404. So only links that can't work outside Nimiq Pay anyway use it.
 */
export const nimiqPayOpenLink = (url: string): string => {
  const { host, pathname, search, hash } = new URL(url);

  return `https://nimpay.app/miniapps/open/${host}${pathname}${search}${hash}`;
};

/** Client-side check for the Nimiq Pay in-app WebView. */
export const isNimiqPayBrowser = (): boolean => {
  if (typeof window === "undefined") return false;

  const nimiqPay = (window as { nimiqPay?: unknown }).nimiqPay;

  return typeof nimiqPay === "object" && nimiqPay !== null;
};

/**
 * External user id stored in `users.privy_user_id` for Nimiq Pay users, who
 * have no Privy account. Unlike MiniPay's, it is only ever minted after the
 * wallet signs for the address (api/nimiq-pay/session).
 */
export const nimiqPayUserId = (address: string) =>
  `nimiqpay:${address.toLowerCase()}`;
