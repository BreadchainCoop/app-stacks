// MiniPay (Opera's stablecoin wallet) runs the app inside its in-app browser
// with the wallet pre-connected. It injects `window.ethereum.isMiniPay` and
// identifies itself in the user agent; there is no message signing
// (personal_sign / eth_signTypedData) available at all.

/** Authoritative client-side check for the MiniPay in-app browser. */
export const isMiniPayBrowser = (): boolean =>
  typeof window !== "undefined" &&
  (window.ethereum as { isMiniPay?: boolean } | undefined)?.isMiniPay === true;

/** Server-side hint from the user agent, used so SSR matches the client. */
export const isMiniPayUserAgent = (userAgent: string | null): boolean =>
  /minipay/i.test(userAgent ?? "");

/**
 * External user id stored in `users.privy_user_id` for MiniPay users, who
 * have no Privy account. The injected address is the identity (issue #154
 * § 2, option 1 — MiniPay's browser is the trust boundary).
 */
export const minipayUserId = (address: string) =>
  `minipay:${address.toLowerCase()}`;

/** MiniPay deeplink for topping up stablecoins ("Deposit" in user copy). */
export const MINIPAY_ADD_CASH_URL =
  "https://link.minipay.xyz/add_cash?tokens=USDT,USDC,USDm";
