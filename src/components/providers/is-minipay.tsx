"use client";

import { createContext, useContext } from "react";

// Whether the MiniPay provider stack is the one that mounted. It is published
// by the root <Providers> branch rather than derived from window.ethereum in
// an effect: an effect-derived value is false on the first render, so every
// consumer rendered its non-MiniPay branch once — which mounted Privy-only
// components, and ran their effects, inside the MiniPay stack.
const IsMiniPayContext = createContext(false);

export const IsMiniPayProvider = IsMiniPayContext.Provider;

export const useIsMiniPay = () => useContext(IsMiniPayContext);

// Whether the *browser* is MiniPay, independent of which chain the URL names.
// Distinct from useIsMiniPay(), which is the conjunction of this and "the chain
// is Celo" — that one is false for MiniPay-on-Gnosis, which is exactly the
// mismatch the chain/browser guard has to detect.
const IsMiniPayBrowserContext = createContext(false);

export const IsMiniPayBrowserProvider = IsMiniPayBrowserContext.Provider;

export const useIsMiniPayBrowser = () => useContext(IsMiniPayBrowserContext);
