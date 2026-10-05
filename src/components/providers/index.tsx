"use client";

import { ReactNode, useEffect, useState } from "react";
// import ToolsProviders from "./tools";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { isMiniPayBrowser } from "@/utils/minipay";
import { isCeloChain } from "@/utils/celo";
import { IsMiniPayBrowserProvider, IsMiniPayProvider } from "./is-minipay";
import { ActiveChainProvider } from "./active-chain";
import ChainBrowserGuard from "../chain-browser-guard";
import { CHAIN_PARAM, chainIdFromSlug } from "@/lib/chain-slugs";
import {
  CONFIGURED_CHAIN_IDS,
  isConfiguredChain,
} from "@/lib/configured-chains";

const CELO_CHAIN_IDS = [42220, 11142220];
const defaultChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

/**
 * The chain a browser gets when the URL doesn't settle it.
 *
 * MiniPay only ever runs against Celo and the Privy stack cannot transact on it,
 * so the browser determines the chain: MiniPay -> Celo, anything else -> the
 * deployment's default.
 */
const browserChainId = (miniPay: boolean): number => {
  if (miniPay) {
    const celo = CELO_CHAIN_IDS.find((id) => CONFIGURED_CHAIN_IDS.includes(id));
    if (celo !== undefined) return celo;
  }

  // NEXT_PUBLIC_CHAIN_ID can name a chain NEXT_PUBLIC_CHAINS doesn't configure
  // (they're set independently per environment), so fall back to one this
  // deployment actually serves.
  if (isConfiguredChain(defaultChainId)) return defaultChainId;

  return CONFIGURED_CHAIN_IDS[0] ?? defaultChainId;
};

// Only one of these stacks ever mounts, so each is code-split: a MiniPay user
// never downloads Privy/RainbowKit, and the web build never downloads the
// MiniPay wagmi config. Both still render on the server (the UA hint below
// picks the branch), so the initial HTML is unaffected.
const MiniPayProviders = dynamic(() =>
  import("./minipay").then((m) => m.MiniPayProviders)
);
const PrivyProviders = dynamic(() => import("./privy"));

const Providers = ({
  children,
  isMobile,
  isMiniPay,
}: {
  children: ReactNode;
  isMobile: boolean;
  isMiniPay: boolean;
}) => {
  // Server-side UA hint keeps hydration consistent; the injected
  // window.ethereum.isMiniPay flag is authoritative and corrects the hint
  // after mount (MiniPay's UA and injected flag agree in practice).
  const [miniPay, setMiniPay] = useState(isMiniPay);

  // Read here rather than passed down from the layout: a layout can't see
  // searchParams, but this is a client component and every route is dynamic
  // (the layout's headers() calls), so useSearchParams is already populated
  // during the server render. That keeps the stack choice below server-side.
  const slug = useSearchParams().get(CHAIN_PARAM);

  useEffect(() => {
    if (isMiniPayBrowser()) {
      setMiniPay(true);
      return;
    }

    // window.ethereum can be injected after hydration, so an immediate
    // "not MiniPay" reading is not yet conclusive — give the provider a
    // chance to announce itself before falling back to the Privy stack.
    const recheck = () => setMiniPay(isMiniPayBrowser());

    window.addEventListener("ethereum#initialized", recheck, { once: true });
    const timer = setTimeout(recheck, 500);

    return () => {
      window.removeEventListener("ethereum#initialized", recheck);
      clearTimeout(timer);
    };
  }, []);

  // A slug that names a configured chain wins; anything else — absent, unknown,
  // or a chain this deployment doesn't serve — falls back to the browser's.
  // Nothing in the app emits an unconfigured slug, so the fallback is for
  // hand-edited or stale links only.
  const fromParam = slug === null ? undefined : chainIdFromSlug(slug);
  const chainId =
    fromParam !== undefined && isConfiguredChain(fromParam)
      ? fromParam
      : browserChainId(miniPay);

  // The MiniPay stack only makes sense on a Celo chain; a Gnosis URL opened
  // inside MiniPay's browser keeps the Privy stack and hits the guard below.
  const useMiniPayStack = miniPay && isCeloChain(chainId);

  return (
    <ActiveChainProvider chainId={chainId}>
      <IsMiniPayBrowserProvider value={miniPay}>
        <IsMiniPayProvider value={useMiniPayStack}>
          <ChainBrowserGuard>
            {useMiniPayStack ? (
              <MiniPayProviders>{children}</MiniPayProviders>
            ) : (
              <PrivyProviders isMobile={isMobile}>{children}</PrivyProviders>
            )}
          </ChainBrowserGuard>
        </IsMiniPayProvider>
      </IsMiniPayBrowserProvider>
    </ActiveChainProvider>
  );
};

export default Providers;
