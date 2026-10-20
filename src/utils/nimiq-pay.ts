// Nimiq Pay runs mini apps in its in-app WebView. It injects an EIP-1193
// wallet at `window.ethereum` (EIP-6963 discoverable too) and its own
// `window.nimiqPay` object (language, network, fullscreen), both before page
// scripts run. Unlike MiniPay it can sign messages, including EIP-712.

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
