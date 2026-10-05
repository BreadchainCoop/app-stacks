"use client";

import { useConnectedUser } from "@breadcoop/ui";
import { useActiveChainId } from "./active-chain";
import { useEffect } from "react";
import { sepolia } from "viem/chains";

const SepoliaAutoFund = () => {
  const { user } = useConnectedUser();
  const chainId = useActiveChainId();

  useEffect(() => {
    if (
      chainId !== sepolia.id ||
      !(user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN")
    )
      return;

    (async () => {
      try {
        await fetch("/api/funding/sepolia-embedded", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: user.address }),
        });
      } catch {
        void 0;
      }
    })();
    return () => {};
    // @ts-expect-error Assume address is present
  }, [user.status, user.address]);

  return null;
};

export default SepoliaAutoFund;
