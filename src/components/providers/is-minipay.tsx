"use client";

import { createContext, useContext } from "react";

/**
 * Which wallet provider stack mounted: Privy (the web), MiniPay (Celo), or
 * Nimiq Pay (its injected wallet on a non-Celo chain). Only the Privy stack
 * mounts a PrivyProvider, so a component that calls Privy hooks must check
 * `useWalletHost() === "privy"` — not `!useIsMiniPay()`, which is also true in
 * Nimiq Pay.
 *
 * Published by the root <Providers> branch rather than derived from the
 * browser in an effect: an effect-derived value is wrong on the first render,
 * so every consumer rendered the wrong branch once — which mounted Privy-only
 * components, and ran their effects, inside another stack.
 */
export type WalletHost = "privy" | "minipay" | "nimiqpay";

const WalletHostContext = createContext<WalletHost>("privy");

export const WalletHostProvider = WalletHostContext.Provider;

export const useWalletHost = () => useContext(WalletHostContext);

// Whether the MiniPay provider stack is the one that mounted.
export const useIsMiniPay = () => useWalletHost() === "minipay";

// Whether the *browser* is MiniPay, independent of which chain the URL names.
// Distinct from useIsMiniPay(), which is the conjunction of this and "the chain
// is Celo" — that one is false for MiniPay-on-Gnosis, which is exactly the
// mismatch the chain/browser guard has to detect.
const IsMiniPayBrowserContext = createContext(false);

export const IsMiniPayBrowserProvider = IsMiniPayBrowserContext.Provider;

export const useIsMiniPayBrowser = () => useContext(IsMiniPayBrowserContext);
