import { useEffect, useState } from "react";
import { isMiniPayBrowser } from "@/utils/minipay";
import { isCeloChain } from "@/utils/celo";
import { clientEnv } from "@/lib/env";

// True only when running inside MiniPay's browser AND this deployment is
// configured for Celo — a Gnosis deployment opened inside MiniPay keeps the
// regular Privy experience. window.ethereum only exists client-side, so
// start false (matches SSR markup) and flip after mount.
export const useIsMiniPay = () => {
  const [isMiniPay, setIsMiniPay] = useState(false);

  useEffect(() => {
    setIsMiniPay(
      isMiniPayBrowser() && isCeloChain(clientEnv.NEXT_PUBLIC_CHAIN_ID)
    );
  }, []);

  return isMiniPay;
};
