"use client";

import { ReactNode, useEffect, useState } from "react";
// import ToolsProviders from "./tools";
import dynamic from "next/dynamic";
import { clientEnv } from "@/lib/env";
import { isMiniPayBrowser } from "@/utils/minipay";
import { isCeloChain } from "@/utils/celo";
import { IsMiniPayProvider } from "./is-minipay";

// Only one of these stacks ever mounts, so each is code-split: a MiniPay user
// never downloads Privy/RainbowKit, and the web build never downloads the
// MiniPay wagmi config. Both still render on the server (the UA hint below
// picks the branch), so the initial HTML is unaffected.
const MiniPayProviders = dynamic(() =>
  import("./minipay").then((m) => m.MiniPayProviders)
);
const PrivyProviders = dynamic(() => import("./privy"));

// The MiniPay stack only makes sense on a Celo-configured deployment; a
// Gnosis deployment opened inside MiniPay's browser keeps the Privy stack.
const miniPaySupported = isCeloChain(clientEnv.NEXT_PUBLIC_CHAIN_ID);

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

  const useMiniPayStack = miniPay && miniPaySupported;

  return (
    <IsMiniPayProvider value={useMiniPayStack}>
      {useMiniPayStack ? (
        <MiniPayProviders>{children}</MiniPayProviders>
      ) : (
        <PrivyProviders isMobile={isMobile}>{children}</PrivyProviders>
      )}
    </IsMiniPayProvider>
  );
};

export default Providers;
